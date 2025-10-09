from clerk_backend_api import Clerk

from src.config import config

clerk_client = Clerk(bearer_auth=config.CLERK_SECRET_KEY)

def get_clerk() -> Clerk:
    return clerk_client
