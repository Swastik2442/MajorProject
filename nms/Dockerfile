FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS builder
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy UV_PYTHON_DOWNLOADS=0

COPY common /common

WORKDIR /app
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=nms/uv.lock,target=uv.lock \
    --mount=type=bind,source=nms/pyproject.toml,target=pyproject.toml \
    uv sync --locked --no-install-project --no-dev
COPY nms /app
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-dev

FROM python:3.12-slim-bookworm

RUN groupadd --system --gid 999 nonroot \
 && useradd --system --gid 999 --uid 999 --create-home nonroot

COPY --from=builder --chown=nonroot:nonroot /app /app

ENV PATH="/app/.venv/bin:$PATH"

USER nonroot

WORKDIR /app

RUN mkdir /app/.cache

EXPOSE 5000

CMD ["fastapi", "run", "main.py", "--host", "0.0.0.0", "--port", "5000"]
