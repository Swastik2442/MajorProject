"Services for the API"

import abc

class Service(abc.ABC):
    @abc.abstractmethod
    async def connect(self, *args, **kwargs) -> None:
        "Connect/Initialize the service"

    @abc.abstractmethod
    async def disconnect(self) -> None:
        "Disconnect/Cleanup the service"
