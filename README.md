# Elevatr

An AI-powered resume analysis platform. Upload a resume and get an ATS
compatibility score, line-by-line feedback, internship recommendations, and
access to a streaming career-advice chatbot — all backed by a live LLM.

**Live demo:** https://elevatr-o0l7.onrender.com

## Features

- **Resume analysis** — upload a PDF, get an ATS score, strengths/weaknesses,
  and line-by-line annotations, streamed live as the model works through it
- **Auth** — register/login, resume history saved per account
- **Career chat** — streaming chatbot for career advice
- **Internship recommendations** — AI-generated role suggestions based on a
  saved resume analysis

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React (Vite) + Tailwind CSS |
| Backend | FastAPI (Python) |
| Database | SQLite via SQLAlchemy |
| AI | Groq API (Llama 3.3 70B), streamed token-by-token |
| Auth | JWT |
| Containerization | Single multi-stage Dockerfile (frontend built + served by the backend) |
| Deployment | Docker container deployed to Render |

## Project structure

```
.
├── Dockerfile              # multi-stage build: React → static files served by FastAPI
├── docker-compose.yml       # local full-stack testing
├── backend/                 # FastAPI app, routes, models, AI service
└── frontend/                 # React app (Vite)
```

## Running locally

**Option A — single container (matches production):**
```bash
docker build -t elevatr .
docker run -p 8000:8000 --env-file backend/.env elevatr
```
Visit `http://localhost:8000`.

**Option B — two dev servers (hot reload):**
```bash
# terminal 1
cd backend
python -m venv venv && source venv/bin/activate  # or venv\Scripts\Activate.ps1 on Windows
pip install -r requirements.txt
cp .env.example .env   # fill in GROQ_API_KEY and SECRET_KEY
uvicorn main:app --reload

# terminal 2
cd frontend
npm install
npm run dev
```
Visit `http://localhost:5173`.

## Environment variables

See `backend/.env.example` for the full list. At minimum you need:
- `GROQ_API_KEY` — free key at https://console.groq.com/keys
- `SECRET_KEY` — any random string, used to sign auth tokens

Secrets are never committed — see `.gitignore`.