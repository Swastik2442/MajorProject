for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ') do taskkill /pid %%a /f
docker compose -p zabbix down
docker compose -p nms down
