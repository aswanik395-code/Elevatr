from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from database import get_db
from db_models.user import User
from auth.security import decode_access_token

# tokenUrl is just used to populate Swagger's "Authorize" button correctly.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def _get_user_from_token(token: str | None, db: Session) -> User | None:
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload:
        return None
    email = payload.get("sub")
    if not email:
        return None
    return db.query(User).filter(User.email == email).first()


def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Use this dependency on routes that REQUIRE a logged-in user."""
    user = _get_user_from_token(token, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def get_current_user_optional(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User | None:
    """Use this on routes that work for both guests and logged-in users
    (e.g. resume analysis still works without an account, but is saved
    to history when the person is logged in)."""
    return _get_user_from_token(token, db)
