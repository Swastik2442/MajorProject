"API Service to store Zabbix Alerts in Local Storage"

import logging

from pydantic import BaseModel
from fastapi import FastAPI, Request, Response, status

from templates import parse_json_message

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger()

app = FastAPI()

class ZabbixAlert(BaseModel):
    "Expected Payload from Zabbix webhook"
    to: str | None = None
    subject: str
    message: str

@app.post("/zabbix/webhook")
async def receive_alert(alert: ZabbixAlert, request: Request):
    if request.client is None:
        return {"status": "error"}

    logger.info("Received alert (%s) from %s with subject %s", alert.to, request.client.host, alert.subject)
    logger.info("Message: %s", alert.message)
    try:
        data = parse_json_message(alert.message)
        logger.info("Parsed Data: %s", data)
    except ValueError as e:
        logger.warning("Failed to parse alert message: %s", e)
        return {"status": "error", "message": "Invalid alert message"}

    return {"status": "success"}

@app.get("/")
def root():
    return {"message": "API for Zabbix Alerts Storage"}

@app.get("/favicon.ico")
def favicon():
    return Response(status_code=status.HTTP_204_NO_CONTENT)
