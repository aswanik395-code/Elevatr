import asyncio
import json
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from utils.validation import validate_and_read, ValidationError
from services.pdf_extractor import extract_text, PDFExtractionError
from services.ai_service import analyze_resume, AIAnalysisError
from database import get_db
from db_models.user import User
from db_models.resume import ResumeRecord
from auth.dependencies import get_current_user_optional

router = APIRouter()

STAGES = [
    "Reading your resume…",
    "Checking ATS compatibility…",
    "Scanning for measurable achievements…",
    "Comparing against common role keywords…",
    "Generating recommendations…",
]


def sse(event: str, data: dict) -> str:
    """Format a single Server-Sent Event."""
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


async def stream_events(
    file_bytes: bytes,
    filename: str,
    user: User | None,
    db: Session,
):
    # Emit progress stages first so the frontend can render them immediately,
    # matching the streaming UX described in the project spec.
    for stage in STAGES[:2]:
        yield sse("stage", {"message": stage})
        await asyncio.sleep(0.4)

    try:
        resume_text = await asyncio.to_thread(extract_text, file_bytes)
    except PDFExtractionError as exc:
        yield sse("error", {"error": str(exc)})
        return

    for stage in STAGES[2:]:
        yield sse("stage", {"message": stage})
        await asyncio.sleep(0.4)

    try:
        result = await asyncio.to_thread(analyze_resume, resume_text)
    except AIAnalysisError as exc:
        yield sse("error", {"error": str(exc)})
        return

    # If the person is logged in, save this analysis to their history.
    # Anonymous uploads still work — they just aren't persisted.
    if user is not None:
        try:
            record = ResumeRecord(
                user_id=user.id,
                filename=filename,
                overall_score=result.get("overallScore", 0),
                ats_breakdown=result.get("atsBreakdown", []),
                strengths=result.get("strengths", []),
                weaknesses=result.get("weaknesses", []),
                annotations=result.get("annotations", []),
            )
            db.add(record)
            db.commit()
        except Exception:
            # Saving history should never break the response the person
            # is actively waiting on.
            db.rollback()

    yield sse("result", result)


@router.post("/api/analyze-resume")
async def analyze_resume_endpoint(
    file: UploadFile = File(...),
    current_user: User | None = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    try:
        contents = await validate_and_read(file)
    except ValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return StreamingResponse(
        stream_events(contents, file.filename, current_user, db),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # disable proxy buffering, e.g. nginx
        },
    )
