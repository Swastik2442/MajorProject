"""Local model configuration for an agent."""

from langchain_openai import ChatOpenAI

local_model = ChatOpenAI(
    name="local_model",
    base_url="http://localhost:1234/v1",
    api_key="NO_NEED_HAHA", # type: ignore
    # model="qwen/qwen3-4b-thinking-2507",
    # model="dolphin3.0-llama3.1-8b@q4_k_s",
    model="openai/gpt-oss-20b"
)
