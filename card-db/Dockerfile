ARG PYTHON_VERSION=3.12-slim
FROM python:${PYTHON_VERSION} AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    APP_HOME=/app

WORKDIR ${APP_HOME}

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Leverage layer caching: install dependencies first
COPY requirements.txt ./
RUN pip install --upgrade pip \
    && pip install -r requirements.txt

COPY app ./app

ENV APP_ENV=production \
    REDIS_URL=redis://redis:6379/0 

# Create non-root user
RUN useradd -u 1002 -m appuser \
    && chown -R appuser:appuser ${APP_HOME}

USER appuser

EXPOSE 8081

LABEL org.opencontainers.image.title="GrimoireML Card DB Service" \
    org.opencontainers.image.version="0.1.0" \
    org.opencontainers.image.source="https://github.com/AdamProbert/GrimoireML" \
    org.opencontainers.image.description="Service to manage card database and image caching"

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -fsS http://localhost:8081/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8081"]
