import json

from data import getWebhookScript, json_files_content

apiKey = "<YOUR_API_KEY_HERE>"
apiUrl = "<YOUR_API_URL_HERE>"

data = {"zabbix_export": {
    "version": "7.4",
    "media_types": [{
        "name": "Post to API",
        "type": "WEBHOOK",
        "parameters": [
            {"name": "API_KEY", "value": apiKey},
            {"name": "Message", "value": "{ALERT.MESSAGE}"},
            {"name": "Subject", "value": "{ALERT.SUBJECT}"},
            {"name": "To", "value": "{ALERT.SENDTO}"},
            {"name": "URL", "value": apiUrl}
        ],
        "script": getWebhookScript(),
        "message_templates": [
            {
                "event_source": "TRIGGERS",
                "operation_mode": "PROBLEM",
                "subject": "Problem: {EVENT.NAME}",
                "message": json_files_content["problem_json"]
            },
            {
                "event_source": "TRIGGERS",
                "operation_mode": "RECOVERY",
                "subject": "Resolved in {EVENT.DURATION}: {EVENT.NAME}",
                "message": json_files_content["problem_recovery_json"]
            },
            {
                "event_source": "TRIGGERS",
                "operation_mode": "UPDATE",
                "subject": "Updated problem in {EVENT.AGE}: {EVENT.NAME}",
                "message": json_files_content["problem_update_json"]
            },
            {
                "event_source": "SERVICE",
                "operation_mode": "PROBLEM",
                "subject": "Service \"{SERVICE.NAME}\" problem: {EVENT.NAME}",
                "message": json_files_content["service_json"]
            },
            {
                "event_source": "SERVICE",
                "operation_mode": "RECOVERY",
                "subject": "Service \"{SERVICE.NAME}\" resolved in {EVENT.DURATION}: {EVENT.NAME}",
                "message": json_files_content["service_recovery_json"]
            },
            {
                "event_source": "SERVICE",
                "operation_mode": "UPDATE",
                "subject": "Changed \"{SERVICE.NAME}\" service status to {EVENT.UPDATE.SEVERITY} in {EVENT.AGE}",
                "message": json_files_content["service_update_json"]
            }
        ]
    }]
}}

with open('data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f)
