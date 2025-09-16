from os import getenv
from dotenv import load_dotenv

load_dotenv()
MONGO_CONNECTION_URI = getenv("MONGO_CONNECTION_URI")
assert MONGO_CONNECTION_URI is not None, "MongoDB Connection URI must be set"

DB_NAME = "nms"
PROBLEMS_COL_NAME = "nms_problems"
SERVICES_COL_NAME = "nms_services"
