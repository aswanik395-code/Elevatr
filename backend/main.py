import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from database import engine, Base
from db_models import user, resume, chat  # noqa: F401 - imported so tables register

from routes.analyze import router as analyze_router
from routes.auth import router as auth_router
from routes.users import router as users_router
from routes.resumes import router as resumes_router
from routes.chat import router as chat_router
from routes.recommendations import router as recommendations_router
from utils.rate_limit import RateLimitMiddleware
from config import ALLOWED_ORIGINS

# Creates tables on startup if they don't exist yet (fine for SQLite/dev;
# use Alembic migrations instead if this grows into production use).
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Elevatr Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RateLimitMiddleware)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(resumes_router)
app.include_router(analyze_router)
app.include_router(chat_router)
app.include_router(recommendations_router)


@app.get("/health")
async def health():
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Serve the built React frontend (see Dockerfile — the frontend is built and
# copied into ./static during the image build). This block is a no-op in
# local dev, where ./static won't exist and the frontend runs separately via
# `npm run dev` instead.
# ---------------------------------------------------------------------------
STATIC_DIR = Path(__file__).parent / "static"

if STATIC_DIR.exists():
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Let any real file in static/ (favicon, manifest, etc.) be served
        # directly; otherwise fall back to index.html so React Router can
        # handle the path client-side.
        candidate = STATIC_DIR / full_path
        if full_path and candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(STATIC_DIR / "index.html")
