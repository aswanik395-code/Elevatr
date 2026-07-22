from datetime import datetime, timezone
from sqlalchemy import Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class ResumeRecord(Base):
    __tablename__ = "resume_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    filename: Mapped[str] = mapped_column(String, nullable=False)
    overall_score: Mapped[int] = mapped_column(Integer, nullable=False)

    # Stored as JSON so the full analysis payload can be replayed later
    # without re-calling the AI.
    ats_breakdown: Mapped[list] = mapped_column(JSON, nullable=False)
    strengths: Mapped[list] = mapped_column(JSON, nullable=False)
    weaknesses: Mapped[list] = mapped_column(JSON, nullable=False)
    annotations: Mapped[list] = mapped_column(JSON, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

    owner = relationship("User", back_populates="resumes")
