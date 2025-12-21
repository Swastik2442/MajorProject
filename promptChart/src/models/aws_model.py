"""AWS Bedrock model configuration for an agent."""

from langchain_openai import ChatOpenAI

from src.config import config

aws_model: ChatOpenAI | None = None
if config.AWS_BEDROCK_OPENAI_COMPAT_API_URL is not None and config.AWS_BEDROCK_API_KEY is not None:
    aws_model = ChatOpenAI(
        name="aws_model",
        base_url=config.AWS_BEDROCK_OPENAI_COMPAT_API_URL,
        api_key=config.AWS_BEDROCK_API_KEY,
        # model="openai.gpt-oss-120b-1:0"
        model="openai.gpt-oss-20b-1:0"
    )
