wt new-tab -p "Command Prompt" -d .\nms cmd /k "docker compose up -d && docker compose -f zabbix/docker-compose.yml up -d" ; split-pane -d .\dashboard cmd /k npm run dev
