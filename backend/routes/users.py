from fastapi import APIRouter, Depends

from auth.dependencies import get_current_user
from db_models.user import User
from schemas.user import UserOut

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user
