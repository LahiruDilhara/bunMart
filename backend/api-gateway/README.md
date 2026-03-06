# BunMart API Gateway

Simple FastAPI proxy. Handles 10 services: **cart**, **kitchen**, **notification**, **order**, **payment**, **pricing**, **product**, **review**, **shipping**, **user**.

## Config (.env)

For each service:

- **SERVICE_PREFIX** — path the gateway listens on (e.g. `/cart`)
- **SERVICE_URL** — backend base URL; may include a path (e.g. `http://localhost:8082/api/v1`)

The gateway strips the prefix from the request path and appends the remainder to the service URL.

**Example:** `PREFIX=/cart`, `URL=http://localhost:8082/api/v1`  
Request `GET /cart/products/1` → proxied to `GET http://localhost:8082/api/v1/products/1`

Copy `.env.example` to `.env` and set prefixes and URLs as needed.

## Run

From `backend/api-gateway`:

```bash
pip install -r requirements.txt
python run.py
```

Gateway listens on port 8080. `GET /health` and `GET /` list services.
