from os import getenv
from dotenv import load_dotenv
from zabbix_utils import ZabbixAPI

load_dotenv()
ZABBIX_URL = getenv("ZABBIX_URL")
ZABBIX_USER = getenv("ZABBIX_USER")
ZABBIX_PASSWORD = getenv("ZABBIX_PASSWORD")

zapi = ZabbixAPI(url=ZABBIX_URL, user=ZABBIX_USER, password=ZABBIX_PASSWORD)

# Get all hosts
hosts = zapi.host.get(output=["hostid", "host"]) # type: ignore
print("\n--- Hosts ---")
for h in hosts:
    print(f"{h['hostid']}: {h['host']}")

# Get Zabbix server info
info = zapi.apiinfo.version() # type: ignore
print("\n--- Zabbix Version ---")
print(info)
