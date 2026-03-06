#!/usr/bin/env python3
"""Run the API gateway from the api-gateway directory: python run.py"""
import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8080, reload=True)
