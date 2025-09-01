"API Service to store Zabbix Alerts in Local Storage"

import logging

from pydantic import BaseModel
from fastapi import FastAPI, Request, Response, status

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

    client_host = request.client.host
    logger.info("Received alert from %s", client_host)
    logger.info("To: %s", alert.to)
    logger.info("Subject: %s", alert.subject)
    logger.info("Message: %s", alert.message)

    return {"status": "success"}

@app.get("/")
def root():
    return {"message": "API for Zabbix Alerts Storage"}

@app.get("/favicon.ico")
def favicon():
    return Response(status_code=status.HTTP_204_NO_CONTENT)
