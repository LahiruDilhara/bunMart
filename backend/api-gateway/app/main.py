"""API Gateway: proxy requests to cart, kitchen, notification, order, payment, pricing, product, review, shipping, user."""
from __future__ import annotations

from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, HTTPException, Request, Response

from .config import ServiceRoute, get_settings
from .proxy import build_forward_url, filtered_request_headers, filtered_response_headers

settings = get_settings()


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

    forward_url = build_forward_url(route.url, request.url.path, request.url.query)
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
