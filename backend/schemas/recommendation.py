from pydantic import BaseModel


class InternshipRecommendation(BaseModel):
    title: str
    company: str
    requiredSkills: list[str]
    eligibility: str
    reason: str
    learningResources: list[str]
