"""API Gateway: proxy requests to auth, cart, kitchen, notification, order, payment, pricing, product, review, shipping, user."""
from __future__ import annotations

from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request as StarletteRequest
from starlette.responses import Response as StarletteResponse

from .config import ServiceRoute, get_settings
from .proxy import build_forward_url, filtered_request_headers, filtered_response_headers

settings = get_settings()

# CORS: allow any origin with credentials by reflecting the request Origin
# When credentials=true, Allow-Headers cannot be "*"; reflect request's Access-Control-Request-Headers
CORS_ALLOW_METHODS = "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD"
CORS_DEFAULT_ALLOW_HEADERS = "Accept, Accept-Language, Content-Language, Content-Type, Authorization, Origin, X-Requested-With"
CORS_EXPOSE_HEADERS = "*"


def _cors_headers(origin: str | None, request: StarletteRequest | None = None) -> dict[str, str]:
    allow_headers = CORS_DEFAULT_ALLOW_HEADERS
    if request:
        req_headers = request.headers.get("access-control-request-headers")
        if req_headers:
            allow_headers = req_headers
    h = {
        "Access-Control-Allow-Methods": CORS_ALLOW_METHODS,
        "Access-Control-Allow-Headers": allow_headers,
        "Access-Control-Expose-Headers": CORS_EXPOSE_HEADERS,
        "Access-Control-Allow-Credentials": "true",
    }
    if origin:
        h["Access-Control-Allow-Origin"] = origin
    else:
        h["Access-Control-Allow-Origin"] = "*"
    return h


class CorsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: StarletteRequest, call_next):
        origin = request.headers.get("origin")
        if request.method == "OPTIONS":
            return StarletteResponse(status_code=200, headers=_cors_headers(origin, request))
        response = await call_next(request)
        for k, v in _cors_headers(origin, request).items():
            response.headers[k] = v
        return response


def _pick_route(path: str, routes: list[ServiceRoute]) -> ServiceRoute | None:
    path = (path or "").rstrip("/") or "/"
    for r in routes:
        p = r.prefix
        if path == p or path.startswith(p + "/"):
            return r
    return None


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.http = httpx.AsyncClient(
        follow_redirects=True,
        timeout=httpx.Timeout(settings.gateway_timeout_seconds),
    )
    app.state.routes = settings.service_routes()
    try:
        yield
    finally:
        await app.state.http.aclose()


app = FastAPI(title=settings.gateway_name, lifespan=lifespan)

# Allow CORS for any origin with credentials by reflecting the request Origin
app.add_middleware(CorsMiddleware)


@app.get("/health")
def health():
    return {"status": "ok", "service": settings.gateway_name}


@app.get("/")
def index():
    return {
        "service": settings.gateway_name,
        "services": [{"name": r.name, "prefix": r.prefix, "url": r.url} for r in settings.service_routes()],
    }


METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"]


@app.api_route("/{path:path}", methods=METHODS, include_in_schema=False)
async def proxy(request: Request, path: str):
    route = _pick_route(request.url.path, request.app.state.routes)
    if not route:
        raise HTTPException(404, detail=f"No service for path: {request.url.path!r}")

    # Strip gateway prefix and append remainder to service URL
    # e.g. /cart/products/1 + url http://localhost:6004/api/v1 -> http://localhost:6004/api/v1/products/1
    path_after_prefix = request.url.path[len(route.prefix) :].lstrip("/")
    forward_url = build_forward_url(route.url, path_after_prefix, request.url.query)
    headers = filtered_request_headers(request.headers)
    if request.client:
        headers.setdefault("x-forwarded-for", request.client.host)
    if request.headers.get("host"):
        headers.setdefault("x-forwarded-host", request.headers["host"])
    headers.setdefault("x-forwarded-proto", request.url.scheme)

    body = await request.body()
    try:
        resp = await request.app.state.http.request(
            request.method,
            forward_url,
            content=body if body else None,
            headers=headers,
        )
    except httpx.RequestError as e:
        raise HTTPException(502, detail=f"Backend unavailable: {e}") from e

    return Response(
        content=resp.content,
        status_code=resp.status_code,
        headers=filtered_response_headers(resp.headers.items()),
        media_type=resp.headers.get("content-type"),
    )
