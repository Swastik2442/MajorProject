"Thread Model Schema"

from collections.abc import Sequence

from pydantic import BaseModel, Field

from common.schemas.chartAgg import ChartAgg

from .base import BaseInterface
from .utils import MyDatetime, none, now

class PromptResponse(BaseModel):
    """PromptResponse model representing a response in a Thread."""
    prompt: str = Field(
        title="Prompt",
        description="The prompt sent in the thread"
    )
    response: ChartAgg | None = Field(
        default_factory=none,
        title="Response",
        description="The response received for the prompt"
    )
    createdAt: MyDatetime = Field(
        default_factory=now,
        title="Created At",
        description="Timestamp when the response was generated"
    )

class Thread(BaseInterface):
    """Thread model representing an Agent Thread created by invoking an Agent."""
    class Meta(BaseInterface.Meta):
        @classmethod
        def collection_name(cls) -> str:
            return "threads"

    userId: str = Field(
        title="User ID",
        description="Identifier for the user associated with the thread"
    )

    title: str = Field(
        default_factory=lambda: "Untitled Thread",
        title="Title",
        description="Title of the thread"
    )

    numberOfPrompts: int = Field(
        default_factory=lambda: 0,
        title="Number of Prompts",
        description="Total number of prompts in the thread"
    )
    promptResponses: Sequence[PromptResponse] = Field(
        default_factory=list,
        title="Problem Updates",
        description="Updates done to the problem"
    )

class ThreadLean(BaseInterface):
    """Lean representation of a Thread model."""
    title: str = Field(
        default_factory=lambda: "Untitled Thread",
        title="Title",
        description="Title of the thread"
    )
    numberOfPrompts: int = Field(
        default_factory=lambda: 0,
        title="Number of Prompts",
        description="Total number of prompts in the thread"
    )
