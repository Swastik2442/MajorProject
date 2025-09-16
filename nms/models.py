import uuid
from pydantic import BaseModel, Field

class Update(BaseModel):
    action: str = Field()
    date: str = Field()
    time: str = Field()
    message: str = Field()

class Problem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    zid: str = Field()
    name: str = Field()
    date: str = Field()
    time: str = Field()
    age: str = Field()
    status: str = Field()
    severity: str = Field()
    duration: str | None = Field(None)
    hostname: str = Field()
    updates: list[Update] = Field([])

class ProblemUpdate(BaseModel):
    name: str | None

class Service(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    zid: str = Field()
    name: str = Field()
    date: str = Field()
    time: str = Field()
    age: str = Field()
    severity: str = Field()
    duration: str | None = Field(None)
    description: str = Field()
    rootcause: str = Field()
    hostname: str = Field()
    updates: list[Update] = Field([])

class ServiceUpdate(BaseModel):
    name: str | None
