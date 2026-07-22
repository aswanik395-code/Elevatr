from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from auth.dependencies import get_current_user
from db_models.user import User
from db_models.resume import ResumeRecord
from schemas.resume import ResumeHistoryItem, ResumeDetail

router = APIRouter(prefix="/api/resumes", tags=["resumes"])


@router.get("", response_model=list[ResumeHistoryItem], response_model_by_alias=False)
def list_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    records = (
        db.query(ResumeRecord)
        .filter(ResumeRecord.user_id == current_user.id)
        .order_by(ResumeRecord.created_at.desc())
        .all()
    )
    return records


@router.get("/{resume_id}", response_model=ResumeDetail, response_model_by_alias=False)
def get_resume(
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
    return record
