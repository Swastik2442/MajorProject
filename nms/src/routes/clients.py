"API Routes for handling Client operations"

from collections.abc import Sequence
import logging
from typing import Annotated

from fastapi import APIRouter, Body, Query, Response, status
from fastapi.exceptions import HTTPException
from pymongo import DESCENDING

from src.exceptions import HTTPException as CustomHTTPException
from src.middlewares.client import ClientFromId
from src.middlewares.user import is_org_admin
from src.models import Client, ClientCreate, ClientListItem, ClientUpdate, ClientOwnerUpdate
from src.models.utils import fields, now, to_doc, uuid4_hex
from src.services.auth import ClerkSdk, JwtUserId, generate_secret, get_hashed_secret
from src.services.db import Database
from src.schemas import DataResponse, PaginatedDataResponse, PaginationWithOwnerIdParams, Response as CustomResponse

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/clients",
    tags=["clients"],
)

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
    return DataResponse(data=f"{new_client.idForApi}:::{client_secret}", message="Client created successfully")

@router.get(
    "/",
    response_model=PaginatedDataResponse[Sequence[ClientListItem]],
    responses={404: {"model": CustomHTTPException}}
)
async def list_clients(
    query: Annotated[PaginationWithOwnerIdParams, Query()],
    user_id: JwtUserId,
    clerk: ClerkSdk,
    db: Database,
    response: Response
) -> PaginatedDataResponse[Sequence[ClientListItem]]:
    offset = (query.page - 1) * query.limit
    if query.owner_id is None:
        orgs = await clerk.organizations.list_async(user_id=[user_id], limit=50)
        if orgs is None or len(orgs.data) == 0:
            response.headers["Cache-Control"] = "private, max-age=300"
            return PaginatedDataResponse(data=[], page=query.page, limit=query.limit)

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
    return PaginatedDataResponse(data=clients, page=query.page, limit=query.limit)

@router.get(
    "/{client_id}",
    response_model=DataResponse[ClientListItem],
    responses={404: {"model": CustomHTTPException}}
)
def get_client(findResult: ClientFromId, response: Response) -> DataResponse[ClientListItem]:
    response.headers["Cache-Control"] = "private, max-age=300"
    return DataResponse(data=findResult.client)

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
    return DataResponse(data=f"{id_for_api}:::{client_secret}", message="API key regenerated successfully")

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
