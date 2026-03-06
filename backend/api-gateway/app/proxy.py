"""Proxy helpers: build forward URL and filter headers."""
from __future__ import annotations

from typing import Iterable

import httpx
from starlette.datastructures import Headers

SKIP_HEADERS = {
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "transfer-encoding",
    "upgrade",
    "host",
    "content-length",
}


def filtered_request_headers(headers: Headers) -> dict[str, str]:
    out: dict[str, str] = {}
    for k, v in headers.items():
        if k.lower() in SKIP_HEADERS:
            continue
        out[k] = v
    return out


def filtered_response_headers(items: Iterable[tuple[str, str]]) -> dict[str, str]:
    out: dict[str, str] = {}
    for k, v in items:
        if k.lower() in SKIP_HEADERS or k.lower() == "content-length":
            continue
        out[k] = v
    return out


def build_forward_url(base_url: str, path: str, query: str) -> str:
    base = httpx.URL(base_url)
    path = (path or "").strip()
    if path and not path.startswith("/"):
        path = "/" + path
    path = path or "/"
    q = query.encode("utf-8") if isinstance(query, str) else query
    url = base.copy_with(path=path, query=q)
    return str(url)
