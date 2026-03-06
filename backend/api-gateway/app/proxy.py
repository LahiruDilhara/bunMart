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


def build_forward_url(base_url: str, path_after_prefix: str, query: str) -> str:
    """Append path_after_prefix to base_url's path. base_url may include a path (e.g. http://host:8082/api/v1)."""
    base = httpx.URL(base_url)
    base_path = (base.path or "").rstrip("/") or "/"
    extra = (path_after_prefix or "").strip().lstrip("/")
    if extra:
        new_path = f"{base_path}/{extra}" if base_path != "/" else f"/{extra}"
    else:
        new_path = base_path if base_path != "/" else "/"
    q = query.encode("utf-8") if isinstance(query, str) else query
    url = base.copy_with(path=new_path, query=q)
    return str(url)
