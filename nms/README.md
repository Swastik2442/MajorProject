# Network Monitoring System

## Setup

1. Start Zabbix: `docker compose up -d`
2. Start API Service: `uvicorn api:app --host=0.0.0.0 --port=5000`
3. Go to [`localhost:8080`](http://localhost:8080) and login using username and password.
4. Create a new Trigger Media Type of type Webhook and URL `http://host.docker.internal:5000/zabbix/webhook`.
   1. Add the script in [`webhook-script.js`](./webhook-script.js) in the Script text box.
   2. Add the Message Templates using the JSON strings in [`/templates`](./templates/).
5. Create a new Media for the Zabbix Super-admin with the type as the created Media Type.
6. Create a new Trigger Action with the operation as the created Media Type and User as Zabbix Super-admin.

> Make sure the Zabbix Server (zabbix-agent) host has its DNS set as `zabbix-agent`.
