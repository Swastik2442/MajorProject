import json
from datetime import datetime
from os import getenv
from zoneinfo import ZoneInfo

from bson import ObjectId
from common.models.problem import Problem, Update
from common.models.utils import PyObjectId, severities, to_doc
from dotenv import load_dotenv
from pymongo import AsyncMongoClient
from tqdm import tqdm
from zabbix_utils import AsyncZabbixAPI

load_dotenv()
ZABBIX_URL = getenv("ZABBIX_URL")
ZABBIX_USER = getenv("ZABBIX_USER")
ZABBIX_PASSWORD = getenv("ZABBIX_PASSWORD")
MONGO_CONNECTION_URI = getenv("MONGO_CONNECTION_URI")

zapi = AsyncZabbixAPI(url=ZABBIX_URL, user=ZABBIX_USER, password=ZABBIX_PASSWORD)

db_client = AsyncMongoClient(MONGO_CONNECTION_URI)
db = db_client["nms"]

INTERVALS = (('d', 86400), ('h', 3600), ('m', 60), ('s', 1))
def as_duration(seconds: int):
    """
    Utility to convert seconds to human-readable duration format.

    Source - <https://stackoverflow.com/a/24542445>
    Posted by Mr. B, modified by community. See post 'Timeline' for change history
    Retrieved 2026-01-01, License - CC BY-SA 4.0
    """
    result = []
    for name, count in INTERVALS:
        value = seconds // count
        if value:
            seconds -= value * count
            if value == 1:
                name = name.rstrip('s')
            result.append(f"{value}{name}")
    return ' '.join(result)

START_TIMESTAMP = 1757127866 # September 6 2025 03:04:26 UTC
END_TIMESTAMP = 1767187080   # December 31 2025 13:18:00 UTC
GROUP_IDS = ("883",)
FETCH_LIMIT = 10000
TOTAL_EVENTS = 1593401
TOTAL_PROBLEMS = 797537
EVENTS_FILE_PATH = "batch_events.jsonl"
PROBLEMS_FILE_PATH = "batch_problems.jsonl"
CLIENT_ID = PyObjectId("6953dd2dbdb27364221d387e")

async def batch1():
    """Gets events from Zabbix and writes to a file."""
    # Get Zabbix server info
    info = await zapi.apiinfo.version() # pylint: disable=no-member # type: ignore
    print(f"\n--- Zabbix Version: {info} ---\n")

    # Get events in batches and write to file
    with open(EVENTS_FILE_PATH, "a", encoding="utf-8") as events_file:
        startTimestamp = START_TIMESTAMP
        while startTimestamp < END_TIMESTAMP:
            data = await zapi.event.get( # pylint: disable=no-member # type: ignore
                groupids=["883"],
                time_from=startTimestamp,
                time_till=END_TIMESTAMP,
                source=0,
                object=0,
                selectHosts=["name"],
                sortfield=["clock"],
                sortorder="ASC",
                limit=FETCH_LIMIT,
            )
            if len(data) == 0:
                break
            # {'eventid': '27685675', 'source': '0', 'object': '0', 'objectid': '131739', 'clock': '1708776701', 'value': '1', 'acknowledged': '0', 'ns': '794870165', 'name': 'XYZ', 'severity': '4', 'r_eventid': '0', 'c_eventid': '0', 'correlationid': '0', 'userid': '0', 'opdata': '', 'suppressed': '0', 'urls': []}

            print(f"Fetching Events after {datetime.fromtimestamp(startTimestamp)}")
            for event in data:
                json.dump(event, events_file)
                events_file.write("\n")
            startTimestamp = int(data[-1]['clock']) + 1

def batch2():
    """Processes events file to create problems file."""
    problems: dict[str, Problem] = {}
    recovered = total = 0
    with (
        open(EVENTS_FILE_PATH, "r", encoding="utf-8") as events_file,
        open(PROBLEMS_FILE_PATH, "a", encoding="utf-8") as problems_file
    ):
        for line in tqdm(events_file, "Processing Events", TOTAL_EVENTS):
            event = json.loads(line)
            if event['eventid'] in problems:
                problem = problems[event['eventid']]
                del problems[event['eventid']]
                recoveryAt = datetime.fromtimestamp(
                    int(event['clock']),
                    ZoneInfo("Asia/Kolkata")
                )
                problem.recoveryAt = recoveryAt
                problem.status = "Recovered"
                problem.duration = as_duration(int(
                    (recoveryAt - problem.startedAt).total_seconds()
                ))
                problem.updates = [Update(
                    action="Recovered",
                    message=event['name'],
                    timestamp=recoveryAt
                )]
                problems_file.write(problem.model_dump_json() + "\n")
                recovered += 1
                total += 1
                continue

            problem = Problem(
                zid=event['eventid'],
                clientId=CLIENT_ID,
                name=event['name'],
                severity=severities[int(event['severity'])-1],
                status="Started",
                hostname=event['hosts'][0]['name'],
                startedAt=datetime.fromtimestamp(
                    int(event['clock']),
                    ZoneInfo("Asia/Kolkata")
                )
            )
            if event['r_eventid'] == "0":
                problems_file.write(problem.model_dump_json() + "\n")
                total += 1
            else:
                problems[event['r_eventid']] = problem

    print(f"Total Problems Logged: {total}")
    print(f"Total Problems Recovered: {recovered}")

async def batch3():
    """Inserts problems from problems file to MongoDB."""
    with open(PROBLEMS_FILE_PATH, "r", encoding="utf-8") as problems_file:
        for line in tqdm(problems_file, "Processing Problems", TOTAL_PROBLEMS):
            data = json.loads(line)
            problem = Problem(**data)
            try:
                await db[Problem.Meta.collection_name()].insert_one({
                    **to_doc(problem),
                    "clientId": ObjectId(problem.clientId)
                })
            except Exception as e:
                print(f"Error inserting problem {problem.id}: {e}")

if __name__ == "__main__":
    import asyncio

    async def main():
        await batch1()
        batch2()
        await batch3()

    asyncio.run(main())
