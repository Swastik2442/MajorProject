import logging
import json
from pathlib import Path
from datetime import datetime

from pydantic import BaseModel
from fastapi import FastAPI, Request, Response, status

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger()

# File path for local storage
ALERTS_FILE = Path("zabbix_alerts.json")

app = FastAPI()

# Pydantic model
class ZabbixAlert(BaseModel):
    """Expected Payload from Zabbix webhook"""
    to: str | None = None
    subject: str
    message: str

# storing the alert to locak JSON
def store_alert(alert: ZabbixAlert, client_ip: str):
    alert_data = {
        "timestamp": datetime.utcnow().isoformat(),
        "client_ip": client_ip,
        "to": alert.to,
        "subject": alert.subject,
        "message": alert.message,
    }

    existing_alerts = []
    if ALERTS_FILE.exists():
        try:
            existing_alerts = json.loads(ALERTS_FILE.read_text())
        except json.JSONDecodeError:
            logger.warning("Invalid JSON in alert storage file.")

    existing_alerts.append(alert_data)
    ALERTS_FILE.write_text(json.dumps(existing_alerts, indent=2))
    logger.info("Alert stored locally.")

@app.post("/zabbix/webhook")
async def receive_alert(alert: ZabbixAlert, request: Request):
    if request.client is None:
        return {"status": "error", "reason": "No client info"}

    client_host = request.client.host
    logger.info("Received alert from %s", client_host)
    logger.info("To: %s", alert.to)
    logger.info("Subject: %s", alert.subject)
    logger.info("Message: %s", alert.message)

    store_alert(alert, client_host)

    return {"status": "success"}

# view the alerts that are stored in the local JSON file
@app.get("/alerts")
def get_alerts():
    if not ALERTS_FILE.exists():
        return {"alerts": []}

    try:
        alerts = json.loads(ALERTS_FILE.read_text())
    except json.JSONDecodeError:
        return {"alerts": [], "warning": "Failed to parse alerts file"}

    return {"alerts": alerts}

@app.get("/")
def root():
    return {"message": "API for Zabbix Alerts Storage"}

@app.get("/favicon.ico")
def favicon():
    return Response(status_code=status.HTTP_204_NO_CONTENT)
