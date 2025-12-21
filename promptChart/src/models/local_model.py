"""Local model configuration for an agent."""

from langchain_openai import ChatOpenAI

from src.config import config

local_model = ChatOpenAI(
    name="local_model",
    base_url=config.OPENAI_COMPAT_API_URL,
    api_key="NO_NEED_HAHA", # type: ignore
    model="openai/gpt-oss-20b"
)
