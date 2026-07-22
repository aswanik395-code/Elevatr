import os

# JWT
SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", 60 * 24))

# Database
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./elevatr.db")

# CORS
_raw_origins = os.environ.get("ALLOWED_ORIGIN", "http://localhost:5173")
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]
