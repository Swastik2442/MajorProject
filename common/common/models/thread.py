"Thread Model Schema"

from collections.abc import Sequence

from pydantic import BaseModel, Field

from common.schemas.chartAgg import ChartAgg

from .base import BaseInterface
from .utils import MyDatetime, now

class PromptResponse(BaseModel):
    """PromptResponse model representing a response in a Thread."""
    prompt: str = Field(
        title="Prompt",
        description="The prompt sent in the thread"
    )
    response: ChartAgg = Field(
        title="Response",
        description="The response received for the prompt"
    )
    createdAt: MyDatetime = Field(
        default_factory=now,
        title="Created At",
        description="Timestamp when the response was generated"
    )

class Thread(BaseInterface):
    """Thread model representing an NMS server sending alerts."""
    class Meta(BaseInterface.Meta):
        @classmethod
        def collection_name(cls) -> str:
            return "threads"

    userId: str = Field(
        title="User ID",
        description="Identifier for the user associated with the thread"
    )

    promptResponses: Sequence[PromptResponse] = Field(
        default_factory=list,
        title="Problem Updates",
        description="Updates done to the problem"
    )
