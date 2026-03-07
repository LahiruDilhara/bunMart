# api-gateway — minimal Alpine image
FROM python:3.13-alpine

WORKDIR /app

COPY requirements.txt .
RUN apk add --no-cache --virtual .build-deps \
    gcc musl-dev \
    && pip install --no-cache-dir -r requirements.txt \
    && apk del .build-deps

COPY app/ ./app/
COPY run.py .

EXPOSE 8080

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
