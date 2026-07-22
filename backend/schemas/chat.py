from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field


class ChatMessageIn(BaseModel):
    message: str = Field(min_length=1, max_length=4000)


class ChatMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role: Literal["user", "assistant"]
    content: str
    createdAt: datetime = Field(alias="created_at")
