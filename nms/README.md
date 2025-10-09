# Network Monitoring System

## Setup

1. Start API Server and Database: `docker compose up -d`
2. Optionally, start Zabbix and other services: `docker compose -f zabbix/docker-compose.yml up -d`
3. Setup the API in Zabbix via
   * Script: `python zabbix/setupZabbix.py`
   * Frontend:
     1. Go to [`localhost:8080`](http://localhost:8080) and login using username and password.
     2. Create a new Alert Media Type of type Webhook.
        1. Add the parameter `URL` set to `http://host.docker.internal:5000/zabbix/webhook`.
        2. Add the parameter `API_KEY` set to the API Key generated from the frontend.
        3. Add the script in [`/zabbix/webhook-script.js`](./zabbix/webhook-script.js) in the Script text box.
        4. Add the Message Templates using the JSON strings in [`/src/templates`](./src/templates/).
     3. Create a new Media for a user with the type as the created Media Type.
     4. Create a new Trigger Action and a new Service Action with the operation as the created Media Type and User as selected earlier.

> Make sure the Zabbix Server (zabbix-agent) host has its DNS set as `zabbix-agent`.
