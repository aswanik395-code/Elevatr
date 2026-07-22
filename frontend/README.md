# Elevatr — Frontend

React + Vite + Tailwind frontend for Elevatr, now wired to the FastAPI backend
(auth, resume analysis history, career chat, internship recommendations).

## Setup

```bash
npm install
cp .env.example .env   # set VITE_API_URL if your backend isn't on localhost:8000
npm run dev
```

The backend must be running (default `http://localhost:8000`) with
`ALLOWED_ORIGIN=http://localhost:5173` in its `.env` so CORS allows requests
from this dev server.

## Pages

| Route | Auth | Purpose |
|---|---|---|
| `/` | no | Upload a resume |
| `/analysis` | optional | Streamed analysis of the just-uploaded resume; saved to history if logged in |
| `/login`, `/register` | no | Auth |
| `/history` | yes | List of past analyses |
| `/resumes/:id` | yes | One stored analysis, with a button to generate internship recommendations |
| `/chat` | yes | Streaming career chatbot, with persisted history |

## Notes

- Auth uses a JWT stored in `localStorage` (`elevatr_token`), attached as a
  `Bearer` header by `src/lib/api.js`.
- `/api/analyze-resume` and `/api/chat/send` are POST endpoints that stream
  Server-Sent Events. Since the native `EventSource` API only supports GET,
  `src/lib/api.js` parses the SSE wire format manually over `fetch` (see
  `streamSSE`).
- Anonymous resume uploads still work (the analyze endpoint has optional
  auth) — they just aren't saved to history.
