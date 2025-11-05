from langchain_core.runnables import RunnableConfig
from agent_x import agent, Context

def main():
    config = RunnableConfig(configurable={"thread_id": "1"})

    response = agent.invoke(
        {"messages": [{"role": "user", "content": "what is the weather outside?"}]},
        config=config, # type: ignore
        context=Context(user_id="1")
    )
    print(response['structured_response'])

    # Continue the conversation using the same `thread_id`.
    response = agent.invoke(
        {"messages": [{"role": "user", "content": "thank you!"}]},
        config=config, # type: ignore
        context=Context(user_id="1")
    )
    print(response['structured_response'])

if __name__ == "__main__":
    main()
