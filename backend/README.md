# Elevatr — Backend (Stage 4: chatbot + internship recommendations)

FastAPI backend that extracts text from an uploaded PDF resume, streams back
AI-generated ATS scoring and feedback via Groq, supports user accounts
(JWT auth) with persisted resume history in SQLite, and — new in this
stage — an AI career chatbot and internship role recommendations.

**Resume analysis still works without logging in.** If a valid JWT is sent
with the request, that analysis is also saved to the user's history;
otherwise it just streams back the result without saving anything.
Chat and recommendations require login, since they're tied to a user's
history/context.

## Endpoints

| Method | Path                              | Auth     | Purpose                          |
|--------|------------------------------------|----------|-----------------------------------|
| POST   | `/api/auth/register`               | no       | Create an account                 |
| POST   | `/api/auth/login`                  | no       | Get a JWT (form fields: `username`=email, `password`) |
| GET    | `/api/users/me`                    | yes      | Current user's profile            |
| GET    | `/api/resumes`                     | yes      | List past analyses (summary)      |
| GET    | `/api/resumes/{id}`                | yes      | Full stored analysis for one item |
| GET    | `/api/resumes/{id}/recommendations`| yes      | AI-generated internship role suggestions based on that analysis |
| POST   | `/api/analyze-resume`              | optional | Streams resume analysis; saves to history if logged in |
| POST   | `/api/chat/send`                   | yes      | Streams a career-chat reply, saves both sides to history |
| GET    | `/api/chat/history`                | yes      | Full chat history for the user    |

Passwords are hashed with bcrypt (via passlib) — never stored in plain text.
Tokens are signed JWTs (`python-jose`), valid for `ACCESS_TOKEN_EXPIRE_MINUTES`
(default 24h). SQLite tables are auto-created on startup from the models in
`db_models/`.

### About the internship recommendations

These are **AI-generated, illustrative example roles** based on your resume's
analysis — not live job postings pulled from a real internship database.
The prompt (`prompts/internship_recommendation.py`) deliberately asks for
realistic *role types* rather than claiming to know about actual current
openings, to avoid implying it found real postings it didn't. If you later
want real listings, that would mean integrating a jobs API (e.g. LinkedIn,
Indeed, Handshake) instead of/alongside the AI generation.

### About the chatbot

`POST /api/chat/send` streams Server-Sent Events:
- `event: token` — one per chunk of the reply as it's generated
- `event: done` — sent once the full reply is saved to history
- `event: error` — sent if the AI call fails

The last 20 messages are sent as context on each turn, so the model keeps
conversational continuity without the prompt growing unbounded.

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# then edit .env and paste your OWN Groq key into GROQ_API_KEY
```

Get a key at https://aistudio.google.com/apikey. **Never commit `.env`** —
it's already git-ignored.

## Run it

```bash
uvicorn main:app --reload
```

API docs: http://localhost:8000/docs
Health check: http://localhost:8000/health

## Test it without the frontend

**Register + log in:**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "you@example.com", "password": "yourpassword"}'

curl -X POST http://localhost:8000/api/auth/login \
  -d "username=you@example.com&password=yourpassword"
```
Copy the `access_token` from the login response for the next steps.

**Analyze a resume while logged in (saves to history):**
```bash
curl -N -X POST http://localhost:8000/api/analyze-resume \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@/path/to/your_resume.pdf"
```

`-N` disables curl's output buffering so you see the stream arrive live.
You'll see `event: stage` messages first, then either `event: result`
(a JSON object matching the frontend's expected shape) or `event: error`.

**View your history:**
```bash
curl http://localhost:8000/api/resumes \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Analyzing without the `Authorization` header still works — it just won't
be saved anywhere.

**Chat (streams a reply, requires login):**
```bash
curl -N -X POST http://localhost:8000/api/chat/send \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"message": "How should I prepare for a behavioral interview?"}'
```

**Chat history:**
```bash
curl http://localhost:8000/api/chat/history \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Internship recommendations for a past resume analysis:**
```bash
curl http://localhost:8000/api/resumes/1/recommendations \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Run with Docker

```bash
docker compose up --build
```

## How it works

1. `POST /api/analyze-resume` accepts a PDF (validated: PDF only, ≤5MB).
2. Text is extracted with `pdfplumber` (`services/pdf_extractor.py`).
3. A structured prompt (`prompts/resume_analysis.py`) asks the model to return
   scoring/feedback as JSON only.
4. The whole thing streams as Server-Sent Events: progress `stage` events
   first, then a final `result` or `error` event.
5. A basic in-memory rate limiter caps each IP to 10 requests/minute
   (`utils/rate_limit.py`) — fine for a demo, swap for Redis-backed limiting
   before any real deployment with multiple workers.

## Wiring up the frontend

The frontend's `Analysis.jsx` currently uses mock data. Because this
endpoint needs a file in the request body, the browser's built-in
`EventSource` won't work (it's GET-only) — use `fetch` and read the
stream manually instead:

```javascript
const res = await fetch('http://localhost:8000/api/analyze-resume', {
  method: 'POST',
  body: formData, // FormData with the PDF under 'file'
})

const reader = res.body.getReader()
const decoder = new TextDecoder()
let buffer = ''

while (true) {
  const { done, value } = await reader.read()
  if (done) break
  buffer += decoder.decode(value, { stream: true })

  const events = buffer.split('\n\n')
  buffer = events.pop() // keep the last, possibly incomplete chunk

  for (const raw of events) {
    const [eventLine, dataLine] = raw.split('\n')
    const event = eventLine.replace('event: ', '')
    const data = JSON.parse(dataLine.replace('data: ', ''))
    // event is 'stage' | 'result' | 'error'
  }
}
```

Swap this in wherever `Analysis.jsx` currently reads from
`src/data/mockAnalysis.js`.

## Next steps

- Wire the frontend to this endpoint (see above)
- Add `frontend` as a second service in `docker-compose.yml` once both are stable
- Deploy to AWS App Runner per the original project spec
