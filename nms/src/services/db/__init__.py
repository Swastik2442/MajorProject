"API Service to store and serve Zabbix Alerts"

from logging import getLogger
from typing import Annotated, Any

from fastapi import Depends
from pydantic import MongoDsn
from pymongo import AsyncMongoClient
from pymongo.asynchronous.database import AsyncDatabase

from src.config import config
from .init_collections import init_collections

logger = getLogger(__name__)

class DatabaseService:
    def __init__(self) -> None:
        self._db_client: AsyncMongoClient[Any]
        self._db: AsyncDatabase[Any]

    async def get_db_client(self) -> AsyncMongoClient[Any]:
        if not hasattr(self, "_db_client"):
            logger.warning("Database client not connected before access")
            await self.connect()
        return self._db_client

    async def get_db(self) -> AsyncDatabase[Any]:
        if not hasattr(self, "_db"):
            logger.warning("Database client not connected before access")
            await self.connect()
        return self._db

    async def connect(self, dsn: MongoDsn = config.MONGO_CONNECTION_URI):
        self._db_client = AsyncMongoClient(
            str(dsn).replace(":27017", "")
        )
        self._db = self._db_client[config.DB_NAME]
        logger.info("Connected to MongoDB database")

        await init_collections(self._db)
        logger.debug("Initialized collections in MongoDB database")

    async def disconnect(self):
        await self._db_client.close()
        logger.info("Closed connection to database")

db_service = DatabaseService()
DatabaseClient = Annotated[AsyncMongoClient[Any], Depends(db_service.get_db_client)]
Database = Annotated[AsyncDatabase[Any], Depends(db_service.get_db)]
