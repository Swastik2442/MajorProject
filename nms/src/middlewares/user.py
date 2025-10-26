"Middlewares for User-related operations"

from typing import Annotated

from fastapi import Depends, Query, status
from fastapi.exceptions import HTTPException

from src.services.auth import ClerkSdk, JwtUserId, get_jwt_user_id

async def is_org_admin(
    org_id: Annotated[str, Query()],
    user_id: JwtUserId,
    clerk: ClerkSdk
) -> bool:
    org = await clerk.organization_memberships.list_async(
        organization_id=org_id,
        user_id=[user_id],
        limit=1
    )
    if org is None or len(org.data) == 0:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Org not found")
    return org.data[0].role == "org:admin"
IsOrgAdmin = Annotated[bool, Depends(is_org_admin)]

__all__ = [
    "get_jwt_user_id",
    "JwtUserId",
    "is_org_admin",
    "IsOrgAdmin"
]
