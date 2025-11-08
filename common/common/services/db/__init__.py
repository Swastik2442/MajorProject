"Database Service"

from logging import getLogger
from typing import Annotated, Any

from fastapi import Depends
from pydantic import MongoDsn

from pymongo import AsyncMongoClient
from pymongo.asynchronous.database import AsyncDatabase

from common.services import Service
from .init_collections import init_collections

logger = getLogger(__name__)

class DatabaseService(Service):
    def __init__(self) -> None:
        self._db_client: AsyncMongoClient[Any]
        self._db: AsyncDatabase[Any]

    async def get_db_client(self) -> AsyncMongoClient[Any]:
        if not hasattr(self, "_db_client"):
            raise RuntimeError("Database client not connected before access")
        return self._db_client

    async def get_db(self) -> AsyncDatabase[Any]:
        if not hasattr(self, "_db"):
            raise RuntimeError("Database client not connected before access")
        return self._db

    async def connect(self, *args, dsn: MongoDsn | None = None, db_name: str = "nms", **kwargs):
        self._db_client = AsyncMongoClient(
            str(dsn).replace(":27017", "") if dsn is not None else dsn
        )
        self._db = self._db_client[db_name]
        logger.info("Connected to MongoDB database")

        await init_collections(self._db)
        logger.debug("Initialized collections in MongoDB database")

    async def disconnect(self):
        await self._db_client.close()
        logger.info("Closed connection to database")

db_service = DatabaseService()
DatabaseClient = Annotated[AsyncMongoClient[Any], Depends(db_service.get_db_client)]
Database = Annotated[AsyncDatabase[Any], Depends(db_service.get_db)]

__all__ = [
    "DatabaseService",
    "db_service",
    "DatabaseClient",
    "Database"
]
