# GrimoireML Backend (FastAPI Skeleton)

Minimal FastAPI + Pydantic skeleton.

## Features

- FastAPI app with OpenAPI schema (`/openapi.json`)
- Swagger UI at `/docs`, ReDoc at `/redoc`
- Health endpoint at `/health/`
- Example Pydantic model
- Settings via cached `get_settings()`
- Basic pytest example

## Install & Run

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

Visit: <http://localhost:8001/docs>

## Test

```bash
pytest -q
```
