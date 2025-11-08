"""Initialize database collections"""

from pymongo import ASCENDING
from pymongo.asynchronous.database import AsyncDatabase

from common.models import Client, Problem, Service
from common.models.utils import fields

async def init_collections(db: AsyncDatabase) -> None:
    """Initialize database collections"""

    await db[Client.Meta.collection_name()].create_index([
        (fields(Client).ownerId, ASCENDING)
    ])
    await db[Client.Meta.collection_name()].create_index([
        (fields(Client).idForApi, ASCENDING)
    ], unique=True)

    await db[Problem.Meta.collection_name()].create_index([
        (fields(Problem).zid, ASCENDING), (fields(Problem).clientId, ASCENDING)
    ], unique=True)

    await db[Service.Meta.collection_name()].create_index([
        (fields(Service).zid, ASCENDING), (fields(Service).clientId, ASCENDING)
    ], unique=True)

__all__ = ["init_collections"]
