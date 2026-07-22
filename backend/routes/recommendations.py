from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from auth.dependencies import get_current_user
from db_models.user import User
from db_models.resume import ResumeRecord
from schemas.recommendation import InternshipRecommendation
from services.ai_service import recommend_internships, AIAnalysisError

router = APIRouter(prefix="/api/resumes", tags=["recommendations"])


@router.get(
    "/{resume_id}/recommendations",
    response_model=list[InternshipRecommendation],
)
def get_recommendations(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = (
        db.query(ResumeRecord)
        .filter(ResumeRecord.id == resume_id, ResumeRecord.user_id == current_user.id)
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="Resume analysis not found.")

    try:
        recommendations = recommend_internships(
            overall_score=record.overall_score,
            strengths=record.strengths,
            weaknesses=record.weaknesses,
            ats_breakdown=record.ats_breakdown,
        )
    except AIAnalysisError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    return recommendations
