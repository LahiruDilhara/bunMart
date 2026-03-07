# BunMart API Gateway

Simple FastAPI proxy. Handles 11 services: **auth** (and **user** profile), **cart**, **kitchen**, **notification**, **order**, **payment**, **pricing**, **product**, **review**, **shipping**.

## Port map (backend services)

REST ports **6xxx**, gRPC ports **9xxx**.

| Service      | REST port | gRPC port | Gateway prefix |
|-------------|-----------|-----------|----------------|
| auth        | 6001      | 9001      | /auth          |
| user        | (same as auth) | —   | /user          |
| product     | 6003      | —         | /product       |
| cart        | 6004      | 9003      | /cart          |
| order       | 6005      | 9004      | /order         |
| payment     | 6006      | —         | /payment       |
| pricing     | 6007      | 9005      | /pricing       |
| kitchen     | 6008      | 9006      | /kitchen       |
| notification| 6009      | 9007      | /notification  |
| review      | 6010      | 9008      | /review        |
| shipping    | 6011      | 9009      | /shipping      |

**Note:** `/user` is proxied to the same service as `/auth` (userAuthentication on 6001). Profile and addresses are part of the auth service.

## Config (.env)

For each service:

- **SERVICE_PREFIX** — path the gateway listens on (e.g. `/auth`, `/cart`)
- **SERVICE_URL** — backend base URL; may include a path (e.g. `http://localhost:6001/api/v1/auth`)

The gateway strips the prefix from the request path and appends the remainder to the service URL.

**Example (auth):** `AUTH_PREFIX=/auth`, `AUTH_URL=http://localhost:6001/api/v1/auth`  
Request `POST /auth/signin` → proxied to `POST http://localhost:6001/api/v1/auth/signin`

**Example (cart):** `CART_PREFIX=/cart`, `CART_URL=http://localhost:6004/api/v1/cart`  
Request `GET /cart/?userId=1` → proxied to `GET http://localhost:6004/api/v1/cart/?userId=1`

Copy `.env.example` to `.env` and set prefixes and URLs as needed.

## Run

From `backend/api-gateway`:

```bash
pip install -r requirements.txt
python run.py
```

Gateway listens on port 8080. `GET /health` and `GET /` list services.
