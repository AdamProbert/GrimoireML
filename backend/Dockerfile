# syntax=docker/dockerfile:1.7
# Multi-stage build for FastAPI backend

ARG PYTHON_VERSION=3.12-slim
FROM python:${PYTHON_VERSION} AS base

# Environment settings
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    APP_HOME=/app

WORKDIR ${APP_HOME}

# System deps (add build-essential only in builder if compiling deps later)
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency spec first for better layer caching
COPY requirements.txt ./

# Install deps
RUN pip install --upgrade pip \
    && pip install -r requirements.txt

# Copy application source
COPY app ./app

# Create a non-root user
RUN useradd -u 1001 -m appuser \
    && chown -R appuser:appuser ${APP_HOME}
USER appuser

EXPOSE 8000

# Healthcheck hitting FastAPI health endpoint if present
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
