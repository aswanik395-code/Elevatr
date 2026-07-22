# --- Stage 1: build the React frontend -------------------------------------
FROM node:20-slim AS frontend-build
WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
# Built in production mode so src/lib/api.js defaults to relative "/api/..."
# URLs, since the backend will serve this frontend from the same origin.
RUN npm run build

# --- Stage 2: the backend, serving the built frontend -----------------------
FROM python:3.11-slim
WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .
# Drop the built frontend into ./static, which main.py serves automatically
# when present (see the STATIC_DIR block at the bottom of main.py).
COPY --from=frontend-build /app/frontend/dist ./static

EXPOSE 8000

# Respect $PORT if the platform sets one (e.g. some PaaS providers), default
# to 8000 otherwise (matches AWS App Runner's configured container port).
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
