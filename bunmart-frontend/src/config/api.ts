/**
 * API configuration – single place to update gateway base URL.
 * Set VITE_API_GATEWAY_URL in .env (e.g. http://localhost:8080).
 * Auth and user profile are served by the same backend (userAuthentication); gateway prefixes: /auth, /user.
 */
const gatewayBase =
  import.meta.env.VITE_API_GATEWAY_URL ?? "http://localhost:8080";

export const apiGatewayUrl = String(gatewayBase).replace(/\/$/, "");

export const apiPaths = {
  auth: "/auth",
  /** Profile and addresses; proxied to same service as auth (userAuthentication). */
  user: "/user",
  cart: "/cart",
  product: "/product",
  order: "/order",
  payment: "/payment",
  pricing: "/pricing",
  review: "/review",
  shipping: "/shipping",
  notification: "/notification",
  kitchen: "/kitchen",
} as const;

export function getAuthBaseUrl(): string {
  return `${apiGatewayUrl}${apiPaths.auth}`;
}

export function getUserBaseUrl(): string {
  return `${apiGatewayUrl}${apiPaths.user}`;
}

export function getCartBaseUrl(): string {
  return `${apiGatewayUrl}${apiPaths.cart}`;
}
