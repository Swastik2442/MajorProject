"""Models for Events."""

from common.models import Problem, ProblemUpdate, Service, ServiceUpdate
from common.models.problem import Update as PUpdate
from common.models.service import Update as SUpdate
from common.models.utils import PyObjectId

from .base import BaseEventModel


class TriggerAlert(BaseEventModel, Problem):
    """Trigger Alert Event Model."""
    event_name = "new_triggerAlert"

    @classmethod
    def from_problem(
        cls,
        problem: Problem,
        *,
        client_id: PyObjectId
    ) -> "TriggerAlert":
        """Create TriggerAlert from Problem."""
        return cls.model_validate({
            **problem.model_dump(),
            "client_id": client_id
        })


class ServiceProblem(BaseEventModel, Service):
    """Service Problem Event Model."""
    event_name = "new_serviceProblem"

    @classmethod
    def from_service(
        cls,
        service: Service,
        *,
        client_id: PyObjectId
    ) -> "ServiceProblem":
        """Create ServiceProblem from Service."""
        return cls.model_validate({
            **service.model_dump(),
            "client_id": client_id
        })


class TriggerAlertUpdate(BaseEventModel, ProblemUpdate):
    """Trigger Alert Update Event Model."""
    event_name = "update_triggerAlert"

    id: PyObjectId
    update: PUpdate

    @classmethod
    def from_problem_update(
        cls,
        problem_update: ProblemUpdate,
        *,
        id: PyObjectId, # pylint: disable=redefined-builtin
        client_id: PyObjectId,
        update_item: PUpdate
    ) -> "TriggerAlertUpdate":
        """Create TriggerAlertUpdate from ProblemUpdate."""
        return cls.model_validate({
            **problem_update.model_dump(),
            "id": id,
            "client_id": client_id,
            "update": update_item
        })


class ServiceProblemUpdate(BaseEventModel, ServiceUpdate):
    """Service Problem Update Event Model."""
    event_name = "update_serviceProblem"

    id: PyObjectId
    update: SUpdate

    @classmethod
    def from_service_update(
        cls,
        service_update: ServiceUpdate,
        *,
        id: PyObjectId, # pylint: disable=redefined-builtin
        client_id: PyObjectId,
        update_item: SUpdate
    ) -> "ServiceProblemUpdate":
        """Create ServiceProblemUpdate from ServiceUpdate."""
        return cls.model_validate({
            **service_update.model_dump(),
            "id": id,
            "client_id": client_id,
            "update": update_item
        })


class TriggerAlertRecovery(BaseEventModel, ProblemUpdate):
    """Trigger Alert Recovery Event Model."""
    event_name = "recovery_triggerAlert"

    id: PyObjectId
    update: PUpdate

    @classmethod
    def from_problem_update(
        cls,
        problem_update: ProblemUpdate,
        *,
        id: PyObjectId, # pylint: disable=redefined-builtin
        client_id: PyObjectId,
        update_item: PUpdate
    ) -> "TriggerAlertRecovery":
        """Create TriggerAlertRecovery from ProblemUpdate."""
        return cls.model_validate({
            **problem_update.model_dump(),
            "id": id,
            "client_id": client_id,
            "update": update_item
        })


class ServiceProblemRecovery(BaseEventModel, ServiceUpdate):
    """Service Problem Recovery Event Model."""
    event_name = "recovery_serviceProblem"

    id: PyObjectId
    update: SUpdate

    @classmethod
    def from_service_update(
        cls,
        service_update: ServiceUpdate,
        *,
        id: PyObjectId, # pylint: disable=redefined-builtin
        client_id: PyObjectId,
        update_item: SUpdate
    ) -> "ServiceProblemRecovery":
        """Create ServiceProblemRecovery from ServiceUpdate."""
        return cls.model_validate({
            **service_update.model_dump(),
            "id": id,
            "client_id": client_id,
            "update": update_item
        })
