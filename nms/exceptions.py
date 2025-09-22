from typing import Literal

from fastapi import Request, Response, status
from fastapi.utils import is_body_allowed_for_status_code
from fastapi.exceptions import RequestValidationError as FastApiRequestValidationError
from pydantic import Field
from pydantic_core import ErrorDetails
from starlette.exceptions import HTTPException as StarletteHTTPException

from utils import Response as CustomResponse

class RequestValidationError(CustomResponse):
    status: Literal["success", "error"] = Field(default_factory=lambda: "error", init=False, frozen=True)
    message: str | None = Field(default_factory=lambda: "Validation Error")
    errors: list[ErrorDetails]

class HTTPException(CustomResponse):
    status: Literal["success", "error"] = Field(default_factory=lambda: "error", init=False, frozen=True)

async def http_exception_handler(_req: Request, exc: StarletteHTTPException):
    headers = getattr(exc, "headers", None)
    if not is_body_allowed_for_status_code(exc.status_code):
        return Response(status_code=exc.status_code, headers=headers)
    return Response(
        HTTPException(message=exc.detail).model_dump_json(),
        exc.status_code,
        headers
    )

async def validation_exception_handler(_req: Request, exc: FastApiRequestValidationError):
    return Response(
        RequestValidationError(errors=list(exc.errors())).model_dump_json(),
        status.HTTP_422_UNPROCESSABLE_ENTITY
    )
