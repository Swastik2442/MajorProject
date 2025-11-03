FROM python:3.12-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

COPY . /app

WORKDIR /app
RUN uv sync --frozen --no-cache

RUN mkdir /app/.cache

EXPOSE 2442

CMD ["/app/.venv/bin/fastapi", "run", "app/main.py", "--port", "2442", "--host", "0.0.0.0"]
