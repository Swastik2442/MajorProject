"""Initialize database collections"""

from pymongo import ASCENDING
from pymongo.asynchronous.database import AsyncDatabase

from src.models import Client, Problem, Service
from src.models.utils import fields

async def init_collections(db: AsyncDatabase) -> None:
    """Initialize database collections"""
    await db[Client.Meta.collection_name()].create_index([(fields(Client).name, ASCENDING)], unique=True)
    await db[Problem.Meta.collection_name()].create_index([(fields(Problem).zid, ASCENDING)], unique=True)
    await db[Service.Meta.collection_name()].create_index([(fields(Service).zid, ASCENDING)], unique=True)
