"""Response schema definitions for the agent."""

from typing import Literal

from pydantic import BaseModel, Field

class DataSeries(BaseModel):
    """Schema for individual data keys in the chart."""
    key: str = Field(
        description="The key in the data corresponding to this data series."
    )
    label: str = Field(
        description="The label for this data series."
    )
    color: str | None = Field(
        None,
        description="The color associated with this data series, if any."
    )
    data_type: Literal['number', 'string', 'date'] = Field(
        description="The data type of this data series."
    )

class Chart(BaseModel):
    """Schema for chart information in the response."""
    type: Literal['bar', 'line', 'pie'] = Field(
        description="The type of chart to be generated."
    )
    description: str = Field(
        description="A brief description of the chart."
    )
    data_series: list[DataSeries] = Field(
        description="List of data series included in the chart."
    )
    collection_name: str = Field(
        description="The name of the data collection to query."
    )
    mongodb_aggregation_pipeline: list[dict] = Field(
        description="The MongoDB aggregation pipeline to retrieve the data for the chart."
    )

class ResponseFormat(BaseModel):
    """Response schema for the agent."""
    description: str = Field(
        description="A brief description of the response."
    )
    charts: list[Chart] | None = Field(
        None,
        description="A list of charts to be generated, if any."
    )
