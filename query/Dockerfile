ARG PYTHON_VERSION=3.12.1-slim
FROM python:${PYTHON_VERSION} AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    APP_HOME=/app

WORKDIR ${APP_HOME}

# System deps (curl for healthcheck, no build-essential since pure-Python deps)
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Leverage layer caching: copy only requirements first
COPY requirements.txt ./
RUN pip install --upgrade pip \ 
    && pip install -r requirements.txt

# Copy application source
COPY app ./app

# Copy data files
COPY data ./data

# Create non-root user
RUN useradd -u 1002 -m appuser \ 
    && chown -R appuser:appuser ${APP_HOME}
USER appuser

EXPOSE 8080

LABEL org.opencontainers.image.title="GrimoireML Query Service" \
    org.opencontainers.image.version="0.1.0" \
    org.opencontainers.image.source="https://github.com/AdamProbert/GrimoireML" \
    org.opencontainers.image.description="Natural language to Scryfall query compiler service"

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -fsS http://localhost:8080/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
