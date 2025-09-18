from datetime import datetime

from pydantic import BaseModel, Field

def none(): return None
def to_doc(obj: BaseModel): return {k: v for k, v in obj.model_dump().items() if v is not None}

class Update(BaseModel):
    action: str = Field()
    date: str = Field()
    time: str = Field()
    message: str = Field(default_factory=lambda: "")
    username: str | None = Field(default_factory=none)

class Problem(BaseModel):
    createdAt: datetime = Field(default_factory=datetime.now)
    updatedAt: datetime = Field(default_factory=datetime.now)

    zid: str = Field(title="Zabbix Event ID")
    name: str = Field(title="Zabbix Event Name")
    start_date: str = Field()
    start_time: str = Field()
    recovery_date: str | None = Field(default_factory=none)
    recovery_time: str | None = Field(default_factory=none)
    age: str | None = Field(default_factory=none)
    status: str = Field()
    severity: str = Field()
    duration: str | None = Field(default_factory=none)
    hostname: str = Field()
    updates: list[Update] = Field(default_factory=list)

class ProblemUpdate(BaseModel):
    updatedAt: datetime = Field(default_factory=datetime.now)

    recovery_date: str | None = Field(default_factory=none)
    recovery_time: str | None = Field(default_factory=none)
    severity: str = Field()
    duration: str | None = Field(default_factory=none)
    status: str = Field()

class Service(BaseModel):
    createdAt: datetime = Field(default_factory=datetime.now)
    updatedAt: datetime = Field(default_factory=datetime.now)

    zid: str = Field(title="Zabbix Event ID")
    name: str = Field(title="Zabbix Event Name")
    start_date: str = Field()
    start_time: str = Field()
    recovery_date: str | None = Field(default_factory=none)
    recovery_time: str | None = Field(default_factory=none)
    age: str | None = Field(default_factory=none)
    severity: str = Field()
    duration: str | None = Field(default_factory=none)
    description: str = Field()
    rootcause: str = Field()
    updates: list[Update] = Field(default_factory=list)

class ServiceUpdate(BaseModel):
    updatedAt: datetime = Field(default_factory=datetime.now)

    recovery_date: str | None = Field(default_factory=none)
    recovery_time: str | None = Field(default_factory=none)
    severity: str = Field()
    duration: str | None = Field(default_factory=none)
    age: str | None = Field(default_factory=none)
