"""Local model configuration for an agent."""

from langchain_openai import ChatOpenAI

local_model = ChatOpenAI(
    name="local_model",
    base_url="http://localhost:1234/v1",
    api_key="NO_NEED_HAHA", # type: ignore
    model="qwen/qwen3-4b-thinking-2507",
    extra_body={"ttl": 300}, # Auto-evict model after 5 minutes of inactivity
)
