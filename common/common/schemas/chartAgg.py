"""Response schema definitions for the agent."""

from collections.abc import Sequence
from typing import Any, Literal

from pydantic import BaseModel, Field

from common.models.utils import MyDatetime

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
        description="The RGB color code associated with this data series, if any."
    )
    data_type: Literal['number', 'string', 'date'] = Field(
        description="The data type of this data series."
    )
    multiple_entries: bool = Field(
        True,
        description="Indicates if this data series can have multiple values, as in an array of values, or just a single value."
    )

class Chart(BaseModel):
    """Schema for chart information in the response."""
    type: Literal['bar', 'box', 'line', 'pie', 'scatter'] = Field(
        description="The type of chart to be generated."
    )
    description: str = Field(
        description="A brief description of the chart."
    )
    data_series: Sequence[DataSeries] = Field(
        description="List of data series included in the chart."
    )

class Mongo(BaseModel):
    """Schema for MongoDB information in the response."""
    collection_name: str = Field(
        description="The name of the data collection to query."
    )
    mongodb_aggregation_pipeline: Sequence[dict] = Field(
        description="The MongoDB aggregation pipeline to retrieve the data for the chart."
    )

class ChartAndMongo(Chart, Mongo):
    """Schema combining chart and MongoDB information."""

class ChartAndData(Chart):
    """Schema combining chart and data information."""
    data: Any = Field(
        description="The actual data to be used for generating the chart."
    )

class ChartAgg(BaseModel):
    """Response schema for the agent."""
    description: str = Field(
        description="A brief description of the response."
    )
    charts: Sequence[ChartAndMongo] | None = Field(
        None,
        description="A list of charts to be generated, if any."
    )

class ChartsData(BaseModel):
    """Schema for the complete response including data and message."""
    prompt: str = Field(
        description="The prompt associated with the response."
    )
    createdAt: MyDatetime = Field(
        description="The creation timestamp of the response."
    )
    description: str = Field(
        description="A brief description of the response."
    )
    charts: Sequence[ChartAndData] | None = Field(
        None,
        description="A list of charts to be generated, if any."
    )

chart_agg_format_text = """\
{
    "description": "<string - brief description of the response>",
    "charts": null OR [
        {
            "type": "bar" | "box" | "line" | "pie" | "scatter",
            "description": "<string - brief description of this chart>",
            "data_series": [
                {
                    "key": "<string - key in the data>",
                    "label": "<string - human-friendly label>",
                    "color": "<string|null - RGB color code, e.g. '#RRGGBB'>",
                    "data_type": "number" | "string" | "date",
                    "multiple_entries": <boolean>
                },
                ...
            ],
            "collection_name": "<string - name of the MongoDB collection>",
            "mongodb_aggregation_pipeline": [
                { "<aggregation stage>": { /* stage spec */ } },
                ...
            ]
        },
        ...
    ]
}\
"""
