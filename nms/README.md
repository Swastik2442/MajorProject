# Network Monitoring System

## Setup

1. Start Zabbix, API Server, and other services: `docker compose up -d`
2. Setup the API in Zabbix via
   * Script: `python setupZabbix.py`
   * Frontend:
     1. Go to [`localhost:8080`](http://localhost:8080) and login using username and password.
     2. Create a new Alert Media Type of type Webhook and URL `http://host.docker.internal:5000/zabbix/webhook`.
        1. Add the script in [`webhook-script.js`](./webhook-script.js) in the Script text box.
        2. Add the Message Templates using the JSON strings in [`/templates`](./templates/).
     3. Create a new Media for a user with the type as the created Media Type.
     4. Create a new Trigger Action and a new Service Action with the operation as the created Media Type and User as selected earlier.

> Make sure the Zabbix Server (zabbix-agent) host has its DNS set as `zabbix-agent`.
