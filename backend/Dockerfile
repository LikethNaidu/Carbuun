# === Backend Dockerfile for Google Cloud Run ===
FROM python:3.13-slim

WORKDIR /app

# Install dependencies first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app/ ./app/

# Create a non-root user for security
RUN adduser --disabled-password --gecos '' appuser && \
    chown -R appuser:appuser /app
USER appuser

# Expose port (Cloud Run uses PORT env var, default 8080)
ENV PORT=8080

CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT
