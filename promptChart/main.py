"""Main entry point to invoke the agent."""

import asyncio

from langchain_core.runnables import RunnableConfig

from common.services.db import db_service

from src.config import config
from src.agent_x import agent_x
from src.agent_x.tools.mongo import MongoDBAggContext

# TODO: Add a way to let other parts of system invoke the agents (e.g., via API calls or direct function calls)
async def main():
    await db_service.connect(dsn=config.MONGO_CONNECTION_URI, db_name=config.MONGO_DB_NAME)
    agent_config = RunnableConfig(configurable={"thread_id": "1"})

    response = await agent_x.ainvoke(
        {"messages": [{"role": "user", "content": "what things can you do?"}]},
        config=agent_config, # type: ignore
        context=MongoDBAggContext(client_ids=["client_123"])
    )
    print(response)

    # Continue the conversation using the same `thread_id`.
    response = await agent_x.ainvoke(
        {"messages": [{"role": "user", "content": "thank you!"}]},
        config=agent_config, # type: ignore
        context=MongoDBAggContext(client_ids=["client_123"])
    )
    print(response)

if __name__ == "__main__":
    asyncio.run(main())
