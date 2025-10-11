import hashlib
import secrets

from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyCookie, APIKeyHeader

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)
api_key_cookie = APIKeyCookie(name="api_key", auto_error=False)

def get_api_key(
    api_key_header: str | None = Depends(api_key_header),
    api_key_cookie: str | None = Depends(api_key_cookie)
) -> str:
    if api_key_header:
        return api_key_header
    if api_key_cookie:
        return api_key_cookie
    raise HTTPException(status.HTTP_401_UNAUTHORIZED, "API key not provided")

def get_api_key_hash(
    api_key: str = Depends(get_api_key)
) -> str:
    return hashlib.sha256(api_key.encode()).hexdigest()

def generate_api_key() -> str:
    return secrets.token_urlsafe(32)
