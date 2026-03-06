# BunMart API Gateway

Simple FastAPI proxy. Handles 10 services: **cart**, **kitchen**, **notification**, **order**, **payment**, **pricing**, **product**, **review**, **shipping**, **user**.

## Config (.env)

For each service set:

- `SERVICE_PREFIX` — path prefix on the gateway (e.g. `/product`)
- `SERVICE_URL` — backend base URL (e.g. `http://localhost:8081`)

Example: request `GET /product/123` is proxied to `GET http://localhost:8081/product/123`.

Copy `.env.example` to `.env` and set prefixes and URLs as needed.

## Run

From `backend/api-gateway`:

```bash
pip install -r requirements.txt
python run.py
```

Gateway listens on port 8080. `GET /health` and `GET /` list services.
