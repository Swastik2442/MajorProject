"API Routes for handling Client operations"

import logging
from typing import Annotated

from bson import ObjectId
from fastapi import APIRouter, Body, Depends, Query, Response, status
from fastapi.exceptions import HTTPException
from pydantic import BaseModel
from pymongo import DESCENDING

from src.exceptions import HTTPException as CustomHTTPException
from src.models import Client, ClientCreate, ClientListItem, ClientUpdate, ClientOwnerUpdate
from src.models.utils import fields, now, to_doc, uuid4_hex
from src.services.auth import ClerkSdk, JwtUserId, generate_secret, get_hashed_secret
from src.services.db import Database
from src.schemas import DataResponse, PaginatedDataResponse, PaginationParams, Response as CustomResponse

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/clients",
    tags=["clients"],
)

async def is_org_admin(
    org_id: str,
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

class ClientWithPerms(BaseModel):
    client: ClientListItem
    hasEditPerms: bool = False

async def find_client_by_id(
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
ClientFromId = Annotated[ClientWithPerms, Depends(find_client_by_id)]

@router.post(
    "/",
    response_model=DataResponse[str],
    status_code=status.HTTP_201_CREATED,
    responses={400: {"model": CustomHTTPException}}
)
async def create_client(
    client: Annotated[ClientCreate, Body()],
    user_id: JwtUserId,
    clerk: ClerkSdk,
    db: Database
) -> DataResponse[str]:
    if not await is_org_admin(client.ownerId, user_id, clerk):
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "You do not have permission to add clients to this organization"
        )

    tm = now()
    client_secret = generate_secret()
    hashed_secret = get_hashed_secret(client_secret)
    new_client = Client(**client.model_dump(), secretForApi=hashed_secret, createdAt=tm, updatedAt=tm)
    new_client.id = (await db[Client.Meta.collection_name()].insert_one(
        to_doc(new_client)
    )).inserted_id
    return DataResponse[str](data=f"{new_client.idForApi}:::{client_secret}", message="Client created successfully")

class PaginationWithOwnerId(PaginationParams):
    owner_id: str | None = Query(
        default=None,
        title="Owner ID",
        description="ID of the Org whose Clients are to be fetched. If not provided, fetches clients from all Orgs the user belongs to."
    )

@router.get(
    "/",
    response_model=PaginatedDataResponse[list[ClientListItem]],
    responses={404: {"model": CustomHTTPException}}
)
async def list_clients(
    query: Annotated[PaginationWithOwnerId, Query()],
    user_id: JwtUserId,
    clerk: ClerkSdk,
    db: Database,
    response: Response
) -> PaginatedDataResponse[list[ClientListItem]]:
    offset = (query.page - 1) * query.limit
    if query.owner_id is None:
        orgs = await clerk.organizations.list_async(user_id=[user_id], limit=50)
        if orgs is None or len(orgs.data) == 0:
            response.headers["Cache-Control"] = "private, max-age=300"
            return PaginatedDataResponse[list[ClientListItem]](data=[], page=query.page, limit=query.limit)

        clients = await db[Client.Meta.collection_name()].find(
            {fields(Client).ownerId: {"$in": [org.id for org in orgs.data]}},
            {fields(Client).secretForApi: False},
            sort=[(fields(Client).updatedAt, DESCENDING), (fields(Client).createdAt, DESCENDING)],
            skip=offset,
            limit=query.limit
        ).to_list()
    else:
        await is_org_admin(query.owner_id, user_id, clerk) # just to verify access

        clients = await db[Client.Meta.collection_name()].find(
            {fields(Client).ownerId: query.owner_id},
            {fields(Client).secretForApi: False},
            sort=[(fields(Client).updatedAt, DESCENDING), (fields(Client).createdAt, DESCENDING)],
            skip=offset,
            limit=query.limit
        ).to_list()

    clients = [ClientListItem(**client) for client in clients]

    response.headers["Cache-Control"] = "private, max-age=300"
    return PaginatedDataResponse[list[ClientListItem]](data=clients, page=query.page, limit=query.limit)

@router.get(
    "/{client_id}",
    response_model=DataResponse[ClientListItem],
    responses={404: {"model": CustomHTTPException}}
)
def get_client(findResult: ClientFromId, response: Response) -> DataResponse[ClientListItem]:
    response.headers["Cache-Control"] = "private, max-age=300"
    return DataResponse[ClientListItem](data=findResult.client)

@router.put(
    "/{client_id}/regenerate_api_key",
    response_model=DataResponse[str],
    responses={404: {"model": CustomHTTPException}}
)
async def regenerate_client_api_key(
    findResult: ClientFromId,
    db: Database
) -> DataResponse[str]:
    if not findResult.hasEditPerms:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "You do not have permission to regenerate the API key for this client"
        )

    id_for_api = uuid4_hex()
    client_secret = generate_secret()
    hashed_secret = get_hashed_secret(client_secret)
    await db[Client.Meta.collection_name()].update_one(
        {"_id": findResult.client.id},
        {"$set": {
            fields(Client).idForApi: id_for_api,
            fields(Client).secretForApi: hashed_secret,
            fields(Client).updatedAt: now(),
        }}
    )
    return DataResponse[str](data=f"{id_for_api}:::{client_secret}", message="API key regenerated successfully")

@router.put(
    "/{client_id}/change_owner",
    response_model=CustomResponse,
    responses={404: {"model": CustomHTTPException}}
)
async def change_client_owner(
    findResult: ClientFromId,
    client_update: Annotated[ClientOwnerUpdate, Body()],
    user_id: JwtUserId,
    clerk: ClerkSdk,
    db: Database
) -> CustomResponse:
    if not findResult.hasEditPerms:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "You do not have permission to change the owner of this client"
        )
    if findResult.client.ownerId == client_update.ownerId:
        return CustomResponse(message="New owner is same as the current owner")

    if not await is_org_admin(client_update.ownerId, user_id, clerk):
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "You do not have permission to add clients to the new organization"
        )

    await db[Client.Meta.collection_name()].update_one(
        {"_id": findResult.client.id},
        {"$set": {
            fields(Client).ownerId: client_update.ownerId,
            fields(Client).updatedAt: now(),
        }}
    )
    return CustomResponse(message="Client owner changed successfully")

@router.put(
    "/{client_id}",
    response_model=CustomResponse,
    responses={400: {"model": CustomHTTPException}, 404: {"model": CustomHTTPException}}
)
async def update_client(
    findResult: ClientFromId,
    client_update: Annotated[ClientUpdate, Body()],
    db: Database
) -> CustomResponse:
    if not findResult.hasEditPerms:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "You do not have permission to edit this client"
        )

    await db[Client.Meta.collection_name()].update_one(
        {"_id": findResult.client.id},
        {"$set": {**to_doc(client_update), fields(Client).updatedAt: now()}}
    )
    return CustomResponse(message="Client updated successfully")

@router.delete(
    "/{client_id}",
    response_model=CustomResponse,
    responses={404: {"model": CustomHTTPException}}
)
async def delete_client(
    findResult: ClientFromId,
    db: Database
) -> CustomResponse:
    if not findResult.hasEditPerms:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "You do not have permission to delete this client"
        )

    await db[Client.Meta.collection_name()].delete_one({"_id": findResult.client.id})
    return CustomResponse(message="Client deleted successfully")
