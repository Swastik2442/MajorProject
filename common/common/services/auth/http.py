"Middlewares for Clerk-based JWT Authentication"

from logging import getLogger
from typing import Annotated, Any

from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt

from .clerk import clerk_service

logger = getLogger(__name__)

http_bearer = HTTPBearer()
HttpBearerCredentials = Annotated[HTTPAuthorizationCredentials, Depends(http_bearer)]

def _decode_token(token: str, jwks_client: jwt.PyJWKClient, issuer: str) -> dict[str, Any]:
    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        return jwt.decode(
            token,
            key=signing_key,
            algorithms=['RS256'],
            issuer=issuer
        )
    except jwt.exceptions.PyJWTError as e:
        logger.debug("Error while decoding JWT: %s", e)
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token") from e

def get_jwt_payload(
    credentials: HttpBearerCredentials,
    jwks_client: jwt.PyJWKClient = Depends(clerk_service.get_jwks_client),
    issuer: str = Depends(clerk_service.get_issuer)
) -> dict[str, Any]:
    token = credentials.credentials
    return _decode_token(token, jwks_client, issuer)
JwtPayload = Annotated[dict[str, Any], Depends(get_jwt_payload)]

def get_jwt_user_id(payload: JwtPayload) -> str:
    user_id = payload.get('sub', None)
    if user_id is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User ID not found in token")
    return user_id
JwtUserId = Annotated[str, Depends(get_jwt_user_id)]
