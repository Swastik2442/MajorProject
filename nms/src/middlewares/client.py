"Middlewares for Client-related operations"

from typing import Annotated

from fastapi import Depends, HTTPException, status

from common.models import Client
from common.models.utils import fields
from common.services.auth import SplitApiKey, verify_secret
from common.services.db import Database

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
    "get_client_from_api_key",
    "ClientFromApiKey",
]
