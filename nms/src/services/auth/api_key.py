"API Key Utilities and Dependencies"

from dataclasses import dataclass
import secrets
from typing import Annotated

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyCookie, APIKeyHeader

SEPARATOR = ":::"

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)
api_key_cookie = APIKeyCookie(name="api_key", auto_error=False)
ApiKeyFromHeader = Annotated[str | None, Depends(api_key_header)]
ApiKeyFromCookie = Annotated[str | None, Depends(api_key_cookie)]

def get_api_key(api_key_header: ApiKeyFromHeader, api_key_cookie: ApiKeyFromCookie) -> str:
    if api_key_header:
        return api_key_header
    if api_key_cookie:
        return api_key_cookie
    raise HTTPException(status.HTTP_401_UNAUTHORIZED, "API key not provided")
ApiKey = Annotated[str, Depends(get_api_key)]

def generate_secret() -> str:
    secret = secrets.token_urlsafe(32)
    while SEPARATOR in secret:
        secret = secrets.token_urlsafe(32)
    return secret

def get_hashed_secret(secret: str) -> str:
    return bcrypt.hashpw(secret.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_secret(secret: str, hashed_secret: str) -> bool:
    return bcrypt.checkpw(secret.encode('utf-8'), hashed_secret.encode('utf-8'))

def join_api_key(identifier: str, secret: str) -> str:
    return f"{identifier}{SEPARATOR}{secret}"

@dataclass
class IdAndSecret:
    identifier: str
    secret: str

def split_api_key(api_key: ApiKey) -> IdAndSecret:
    parts = api_key.split(SEPARATOR, 1)
    if len(parts) != 2:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid API key format")
    return IdAndSecret(identifier=parts[0], secret=parts[1])
SplitApiKey = Annotated[IdAndSecret, Depends(split_api_key)]
