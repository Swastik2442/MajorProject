from typing import Annotated, Any

from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt

from src.config import config

jwks_client = jwt.PyJWKClient(config.CLERK_JWKS_URL, cache_keys=True, cache_jwk_set=True)
security = HTTPBearer()

def _decode_token(token: str) -> dict[str, Any]:
    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        return jwt.decode(
            token,
            key=signing_key,
            algorithms=['RS256'],
            issuer=config.CLERK_ISSUER
        )
    except jwt.exceptions.PyJWTError as e:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token") from e

def protect_route(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict[str, Any]:
    token = credentials.credentials
    return _decode_token(token)

def get_user_id(payload: dict[str, Any] = Depends(protect_route)) -> str:
    user_id = payload.get('sub', None)
    if user_id is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User ID not found in token")
    return user_id
JwtUserId = Annotated[str, Depends(get_user_id)]
