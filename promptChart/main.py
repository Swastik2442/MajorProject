"""Main entry point to invoke the agent."""

import asyncio

from langchain_core.runnables import RunnableConfig

from common.services.db import db_service

from src.agent_x import agent_x, ContextSchema
from src.config import config

# TODO: Add a way to let other parts of system invoke the agents (e.g., via API calls or direct function calls)
async def main():
    await db_service.connect(dsn=config.MONGO_CONNECTION_URI, db_name=config.MONGO_DB_NAME)
    context = ContextSchema(
        db=await db_service.get_db(),
        client_ids=["client_123"]
    )

    agent_config = RunnableConfig(configurable={"thread_id": "1"})

    response = await agent_x.ainvoke(
        {"messages": [{"role": "user", "content": "create a chart showing the top 10 most common problems reported."}]},
        config=agent_config, # type: ignore
        context=context
    )
    print(response)

if __name__ == "__main__":
    asyncio.run(main())
