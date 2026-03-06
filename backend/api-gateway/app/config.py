"""Load gateway config from .env: prefix and URL per service."""
from __future__ import annotations

from dataclasses import dataclass

from pydantic import AnyHttpUrl
from pydantic_settings import BaseSettings, SettingsConfigDict

SERVICE_NAMES = (
    "cart",
    "kitchen",
    "notification",
    "order",
    "payment",
    "pricing",
    "product",
    "review",
    "shipping",
    "user",
)


@dataclass(frozen=True)
class ServiceRoute:
    name: str
    prefix: str
    url: str


def _norm_prefix(v: str) -> str:
    v = (v or "").strip()
    if not v:
        raise ValueError("prefix cannot be empty")
    if not v.startswith("/"):
        v = "/" + v
    v = v.rstrip("/")
    if not v:
        raise ValueError("prefix cannot be '/' only")
    return v


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    gateway_name: str = "bunmart-api-gateway"
    gateway_timeout_seconds: float = 30.0

    # Prefix (path on gateway) and URL (backend) per service
    cart_prefix: str = "/cart"
    cart_url: AnyHttpUrl = "http://localhost:8082"
    kitchen_prefix: str = "/kitchen"
    kitchen_url: AnyHttpUrl = "http://localhost:8085"
    notification_prefix: str = "/notification"
    notification_url: AnyHttpUrl = "http://localhost:8086"
    order_prefix: str = "/order"
    order_url: AnyHttpUrl = "http://localhost:8083"
    payment_prefix: str = "/payment"
    payment_url: AnyHttpUrl = "http://localhost:8084"
    pricing_prefix: str = "/pricing"
    pricing_url: AnyHttpUrl = "http://localhost:8088"
    product_prefix: str = "/product"
    product_url: AnyHttpUrl = "http://localhost:8081"
    review_prefix: str = "/review"
    review_url: AnyHttpUrl = "http://localhost:8089"
    shipping_prefix: str = "/shipping"
    shipping_url: AnyHttpUrl = "http://localhost:8087"
    user_prefix: str = "/user"
    user_url: AnyHttpUrl = "http://localhost:8090"

    def service_routes(self) -> list[ServiceRoute]:
        routes = [
            ServiceRoute("cart", _norm_prefix(self.cart_prefix), str(self.cart_url)),
            ServiceRoute("kitchen", _norm_prefix(self.kitchen_prefix), str(self.kitchen_url)),
            ServiceRoute(
                "notification",
                _norm_prefix(self.notification_prefix),
                str(self.notification_url),
            ),
            ServiceRoute("order", _norm_prefix(self.order_prefix), str(self.order_url)),
            ServiceRoute("payment", _norm_prefix(self.payment_prefix), str(self.payment_url)),
            ServiceRoute("pricing", _norm_prefix(self.pricing_prefix), str(self.pricing_url)),
            ServiceRoute("product", _norm_prefix(self.product_prefix), str(self.product_url)),
            ServiceRoute("review", _norm_prefix(self.review_prefix), str(self.review_url)),
            ServiceRoute("shipping", _norm_prefix(self.shipping_prefix), str(self.shipping_url)),
            ServiceRoute("user", _norm_prefix(self.user_prefix), str(self.user_url)),
        ]
        prefixes = [r.prefix for r in routes]
        if len(prefixes) != len(set(prefixes)):
            dups = [p for p in prefixes if prefixes.count(p) > 1]
            raise ValueError(f"Duplicate prefix in .env: {set(dups)}")
        routes.sort(key=lambda r: len(r.prefix), reverse=True)
        return routes


_settings: Settings | None = None


def get_settings() -> Settings:
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings
