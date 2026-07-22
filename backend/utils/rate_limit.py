import time
from collections import defaultdict, deque
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

WINDOW_SECONDS = 60
MAX_REQUESTS = 10


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Naive single-process rate limiter. Good enough for a demo/internship
    project; for real deployments use Redis-backed limiting (e.g. slowapi
    with a shared store) since this resets on every restart and doesn't
    share state across multiple workers/instances."""

    def __init__(self, app):
        super().__init__(app)
        self.hits: dict[str, deque] = defaultdict(deque)

    async def dispatch(self, request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        now = time.monotonic()
        hits = self.hits[client_ip]

        while hits and now - hits[0] > WINDOW_SECONDS:
            hits.popleft()

        if len(hits) >= MAX_REQUESTS:
            return JSONResponse(
                status_code=429,
                content={"error": "Too many requests. Try again in a minute."},
            )

        hits.append(now)
        return await call_next(request)
