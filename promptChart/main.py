"""Main entry point to invoke the agent."""

from langchain_core.runnables import RunnableConfig

from src.agent_x import agent_x
from src.agent_x.tools.mongo import MongoDBAggContext

# TODO: Add a way to let other parts of system invoke the agents (e.g., via API calls or direct function calls)
def main():
    config = RunnableConfig(configurable={"thread_id": "1"})

    response = agent_x.invoke(
        {"messages": [{"role": "user", "content": "what things can you do?"}]},
        config=config, # type: ignore
        context=MongoDBAggContext(client_ids=["client_123"])
    )
    print(response['structured_response'])

    # Continue the conversation using the same `thread_id`.
    response = agent_x.invoke(
        {"messages": [{"role": "user", "content": "thank you!"}]},
        config=config, # type: ignore
        context=MongoDBAggContext(client_ids=["client_123"])
    )
    print(response['structured_response'])

if __name__ == "__main__":
    main()
