# Network Monitoring System

## Setup

1. Start Zabbix: `docker compose up -d`
2. Start API Service: `uvicorn api:app --host=0.0.0.0 --port=5000`
3. Go to [`localhost:8080`](http://localhost:8080) and login using username and password.
4. Create a new Trigger Media Type of type Webhook and URL `http://host.docker.internal:5000/zabbix/webhook`. Add the script in [`webhook-script.js`](./webhook-script.js) in the Script text box.
5. Create a new Trigger Action with the operation as the created Media Type and User Group as Zabbix administrators.

> Make sure the Zabbix Server (zabbix-agent) host has its DNS set as `zabbix-agent`.
