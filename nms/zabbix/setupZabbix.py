import os
from collections.abc import Callable
from typing import Literal

from zabbix_utils import ZabbixAPI

templates_dir = os.path.join(os.path.dirname(__file__), '..', 'src', 'templates')
_json_files_content: dict[str, str] = {}
for filename in os.listdir(templates_dir):
    if filename.endswith('.json'):
        with open(os.path.join(templates_dir, filename), 'r', encoding='utf-8') as f:
            var_name = os.path.splitext(filename)[0].replace('-', '_') + '_json'
            content = f.read().strip()
            _json_files_content[var_name] = content.replace('\n', '').replace(' ', '')

def _getWebhookScript() -> str:
    with open(os.path.join(os.path.dirname(__file__), "webhook-script.js"), 'r', encoding='utf-8') as f:
        whScript = f.read().strip()
    return whScript

def createMediaType(zapi: ZabbixAPI, apiUrl: str, apiKey: str, mediaTypeId: str | None = None) -> str | None:
    params = {
        "type": "4",
        "name": "Post to API",
        "parameters": [
            {"name": "Message", "value": "{ALERT.MESSAGE}"},
            {"name": "Subject", "value": "{ALERT.SUBJECT}"},
            {"name": "To", "value": "{ALERT.SENDTO}"},
            {"name": "URL","value": apiUrl},
            {"name": "API_KEY", "value": apiKey}
        ],
        "script": _getWebhookScript(),
        "status": "0",
        "message_templates": [
            {
                "eventsource": "0",
                "recovery": "0",
                "subject": "Problem: {EVENT.NAME}",
                "message": _json_files_content["problem_json"]
            },
            {
                "eventsource": "0",
                "recovery": "1",
                "subject": "Resolved in {EVENT.DURATION}: {EVENT.NAME}",
                "message": _json_files_content["problem_recovery_json"]
            },
            {
                "eventsource": "0",
                "recovery": "2",
                "subject": "Updated problem in {EVENT.AGE}: {EVENT.NAME}",
                "message": _json_files_content["problem_update_json"]
            },
            {
                "eventsource": "4",
                "recovery": "0",
                "subject": "Service \"{SERVICE.NAME}\" problem: {EVENT.NAME}",
                "message": _json_files_content["service_json"]
            },
            {
                "eventsource": "4",
                "recovery": "1",
                "subject": "Service \"{SERVICE.NAME}\" resolved in {EVENT.DURATION}: {EVENT.NAME}",
                "message": _json_files_content["service_recovery_json"]
            },
            {
                "eventsource": "4",
                "recovery": "2",
                "subject": "Changed \"{SERVICE.NAME}\" service status to {EVENT.UPDATE.SEVERITY} in {EVENT.AGE}",
                "message": _json_files_content["service_update_json"]
            }
        ]
    }

    method: Callable = zapi.mediatype.create # type: ignore
    if mediaTypeId is not None:
        method = zapi.mediatype.update # type: ignore
        params["mediatypeid"] = mediaTypeId

    response = method(params)

    if mediaTypeId is not None:
        assert "mediatypeids" in response and mediaTypeId in response["mediatypeids"], "Updating Media Type failed"
    else:
        assert "mediatypeids" in response and (len(response["mediatypeids"]) > 0), "Creating Media Type failed"
        return response["mediatypeids"][0]

def createMedia(zapi: ZabbixAPI, apiUrl: str, userId: str, mediaTypeId: str) -> None:
    response = zapi.user.update({ # type: ignore
        "userid": str(userId),
        "medias": [{
            "mediatypeid": mediaTypeId,
            "sendto": apiUrl
        }]
    })
    assert "userids" in response and str(userId) in response["userids"], "Could not add Media to User"

def createAction(zapi: ZabbixAPI, userId: str, mediaTypeId: str, eventsource: Literal[0, 4], name: str = "Report to API") -> None:
    response = zapi.action.create({ # type: ignore
        "name": name,
        "eventsource": eventsource,
        "esc_period": "1h",
        "operations": [{
            "operationtype": 0,
            "opmessage_usr": [{"userid": userId}],
            "opmessage": {"mediatypeid": mediaTypeId}
        }],
        "recovery_operations": [{
            "operationtype": 0,
            "opmessage_usr": [{"userid": userId}],
            "opmessage": {"mediatypeid": mediaTypeId}
        }],
        "update_operations": [{
            "operationtype": 0,
            "opmessage_usr": [{"userid": userId}],
            "opmessage": {"mediatypeid": mediaTypeId}
        }]
    })
    assert "actionids" in response and len(response["actionids"]) > 0, "Could not create Action"

if __name__ == "__main__":
    from dotenv import load_dotenv

    load_dotenv()
    ZABBIX_URL = os.getenv("ZABBIX_URL")
    ZABBIX_USER = os.getenv("ZABBIX_USER")
    ZABBIX_PASSWORD = os.getenv("ZABBIX_PASSWORD")

    zapi = ZabbixAPI(url=ZABBIX_URL, user=ZABBIX_USER, password=ZABBIX_PASSWORD)

    userId = str(int(input("Enter the ID of the User for whom the Triggers have to be added: ")))
    apiUrl = input("Enter the URL for the API: ").strip()
    apiKey = input("Enter the API Key for the API: ").strip()

    # Create Media Type
    mediaTypeId = createMediaType(zapi, apiUrl, apiKey)
    assert mediaTypeId is not None
    print("\nCreated Media Type with ID:", mediaTypeId)

    # Create Media for selected User
    createMedia(zapi, apiUrl, userId, mediaTypeId)
    print("Added Media to User")

    # Create Actions with Media Type for selected User
    createAction(zapi, userId, mediaTypeId, 0, "Report Triggers to API")
    print("Created Action for Triggers")
    createAction(zapi, userId, mediaTypeId, 4, "Report Service Updates to API")
    print("Created Action for Service Updates")

    print("\nTriggers added successfully")
