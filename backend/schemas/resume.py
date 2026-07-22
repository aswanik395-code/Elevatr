from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from typing import Literal


class ATSCategory(BaseModel):
    label: str
    score: int = Field(ge=0, le=100)


class Annotation(BaseModel):
    line: str
    type: Literal["weak", "strong"]
    note: str
    rewrite: str | None = None


class AnalysisResult(BaseModel):
    overallScore: int = Field(ge=0, le=100)
    atsBreakdown: list[ATSCategory]
    strengths: list[str]
    weaknesses: list[str]
    annotations: list[Annotation]


class ErrorResponse(BaseModel):
    error: str
    detail: str | None = None


class ResumeHistoryItem(BaseModel):
    """Summary shown in a list of past analyses."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    filename: str
    overallScore: int = Field(alias="overall_score")
    createdAt: datetime = Field(alias="created_at")


class ResumeDetail(BaseModel):
    """Full stored analysis for one past resume upload."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    filename: str
    overallScore: int = Field(alias="overall_score")
    atsBreakdown: list[ATSCategory] = Field(alias="ats_breakdown")
    strengths: list[str]
    weaknesses: list[str]
    annotations: list[Annotation]
    createdAt: datetime = Field(alias="created_at")
