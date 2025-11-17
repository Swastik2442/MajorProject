"""API Service to serve LangChain based agents"""

import logging

from fastapi import APIRouter

from .agent_x import router as agent_x_router

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/agents",
    tags=["agents"]
)

router.include_router(agent_x_router)
