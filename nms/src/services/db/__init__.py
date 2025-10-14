"API Service to store and serve Zabbix Alerts"

from logging import getLogger
from typing import Annotated, Any

from fastapi import Depends
from pymongo import AsyncMongoClient
from pymongo.asynchronous.database import AsyncDatabase

from src.config import config
from .init_collections import init_collections

logger = getLogger(__name__)

db_client = AsyncMongoClient(str(config.MONGO_CONNECTION_URI).replace(f":27017", ""), connect=False)
db = db_client[config.DB_NAME]

def get_db_client() -> AsyncMongoClient[Any]: return db_client
DatabaseClient = Annotated[AsyncMongoClient[Any], Depends(get_db_client)]

def get_db() -> AsyncDatabase[Any]: return db
Database = Annotated[AsyncDatabase[Any], Depends(get_db)]

async def connect():
    await db_client.aconnect()
    await init_collections(db)
    logger.info("Connected to MongoDB database")

async def disconnect():
    await db_client.close()
    logger.info("Closed connection to database")
