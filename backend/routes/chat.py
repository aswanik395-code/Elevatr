import json
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from database import get_db
from auth.dependencies import get_current_user
from db_models.user import User
from db_models.chat import ChatMessage
from schemas.chat import ChatMessageIn, ChatMessageOut
from services.ai_service import stream_chat, AIChatError

router = APIRouter(prefix="/api/chat", tags=["chat"])

MAX_HISTORY_MESSAGES = 20  # keep prompts small; recent context is enough


def sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


@router.get("/history", response_model=list[ChatMessageOut], response_model_by_alias=False)
def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == current_user.id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )


async def stream_reply(user_id: int, history: list[dict], message: str, db: Session):
    full_reply = ""
    try:
        for chunk in stream_chat(history, message):
            full_reply += chunk
            yield sse("token", {"text": chunk})
    except AIChatError as exc:
        yield sse("error", {"error": str(exc)})
        return

    # Persist both sides of the exchange once the stream completes.
    db.add(ChatMessage(user_id=user_id, role="user", content=message))
    db.add(ChatMessage(user_id=user_id, role="assistant", content=full_reply))
    db.commit()

    yield sse("done", {})


@router.post("/send")
def send_chat_message(
    payload: ChatMessageIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    past = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == current_user.id)
        .order_by(ChatMessage.created_at.desc())
        .limit(MAX_HISTORY_MESSAGES)
        .all()
    )
    history = [{"role": m.role, "content": m.content} for m in reversed(past)]

    return StreamingResponse(
        stream_reply(current_user.id, history, payload.message, db),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
