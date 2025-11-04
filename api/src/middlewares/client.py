"Middlewares for Client-related operations"

from collections.abc import Sequence
from dataclasses import dataclass
from typing import Annotated

from bson import ObjectId
from fastapi import Depends, HTTPException, Query, status

from common.models import Client, ClientListItem
from common.models.utils import fields
from common.services.auth import ClerkSdk, JwtUserId
from common.services.db import Database
from src.middlewares.user import is_org_admin
from src.schemas import ClientsParams

async def get_clients_from_query(
    clients_query: Annotated[ClientsParams, Query()],
    user_id: JwtUserId,
    clerk: ClerkSdk,
    db: Database
) -> Sequence[ClientListItem]:
    # Get all Clients in the Org
    if clients_query.org_id is not None:
        orgs = await clerk.organizations.list_async(
            organization_id=[clients_query.org_id],
            user_id=[user_id],
            limit=1
        )
        if orgs is None or len(orgs.data) == 0:
            raise HTTPException(
                status.HTTP_401_UNAUTHORIZED,
                "Organization not found or you don't have access to it"
            )

        return [
            ClientListItem(**doc) async for doc in db[Client.Meta.collection_name()].find(
                {fields(Client).ownerId: orgs.data[0].id},
                {fields(Client).idForApi: False, fields(Client).secretForApi: False}
            )
        ]

    # Get specific Clients by ID(s)
    if clients_query.client_id is not None:
        if isinstance(clients_query.client_id, str): # Single ID
            client = await db[Client.Meta.collection_name()].find_one(
                {"_id": ObjectId(clients_query.client_id)},
                {fields(Client).idForApi: False, fields(Client).secretForApi: False}
            )
            if client is None:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Client not found")
            clients = [ClientListItem(**client)]
        else:                                        # List of IDs
            clients = [
                ClientListItem(**doc) async for doc in db[Client.Meta.collection_name()].find(
                    {"_id": {"$in": [ObjectId(cid) for cid in clients_query.client_id]}},
                    {fields(Client).idForApi: False, fields(Client).secretForApi: False}
                )
            ]

        # Ensure user has access to all requested Clients
        orgs = await clerk.organizations.list_async(
            organization_id=[client.ownerId for client in clients],
            user_id=[user_id]
        )
        if orgs is None or orgs.total_count != len(set(client.ownerId for client in clients)):
            raise HTTPException(
                status.HTTP_401_UNAUTHORIZED,
                "Client not found or you don't have access to it"
            )

        return clients

    # Get all Clients accessible to the user
    orgs = await clerk.organizations.list_async(user_id=[user_id])
    if orgs is None or len(orgs.data) == 0:
        return []
    return [
        ClientListItem(**doc) async for doc in db[Client.Meta.collection_name()].find(
            {fields(Client).ownerId: {"$in": [org.id for org in orgs.data]}},
            {fields(Client).idForApi: False, fields(Client).secretForApi: False}
        )
    ]
ClientsFromQuery = Annotated[Sequence[ClientListItem], Depends(get_clients_from_query)]

@dataclass(frozen=True)
class ClientWithPerms:
    client: ClientListItem
    hasEditPerms: bool = False

async def get_client_from_id(
    client_id: str,
    user_id: JwtUserId,
    clerk: ClerkSdk,
    db: Database
) -> ClientWithPerms:
    client = await db[Client.Meta.collection_name()].find_one(
        {"_id": ObjectId(client_id)},
        {fields(Client).idForApi: False, fields(Client).secretForApi: False}
    )
    if client is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Client not found")
    client = ClientListItem(**client)

    isAdmin = await is_org_admin(client.ownerId, user_id, clerk)

    return ClientWithPerms(
        client=client,
        hasEditPerms=isAdmin
    )
ClientFromId = Annotated[ClientWithPerms, Depends(get_client_from_id)]

__all__ = [
    "get_clients_from_query",
    "ClientsFromQuery",
    "ClientWithPerms",
    "get_client_from_id",
    "ClientFromId"
]
