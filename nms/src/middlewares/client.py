"Middlewares for Client-related operations"

from typing import Annotated

from common.models import Client
from common.models.utils import fields
from common.services.auth import SplitApiKey, verify_secret
from common.services.db import Database
from fastapi import Depends, HTTPException, status


async def get_client_from_api_key(db: Database, idAndSecret: SplitApiKey) -> Client:
    client = await db[Client.Meta.collection_name()].find_one(
        {fields(Client).idForApi: idAndSecret.identifier}
    )
    if client is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Client not found")
    client = Client(**client)

    if not verify_secret(idAndSecret.secret, client.secretForApi):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid API Key")
    return client
ClientFromApiKey = Annotated[Client, Depends(get_client_from_api_key)]

__all__ = [
    "ClientFromApiKey",
    "get_client_from_api_key",
]
