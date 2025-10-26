import os

templates_dir = os.path.join(os.path.dirname(__file__), '..', 'nms', 'src', 'templates')
json_files_content: dict[str, str] = {}
for filename in os.listdir(templates_dir):
    if filename.endswith('.json'):
        with open(os.path.join(templates_dir, filename), 'r', encoding='utf-8') as f:
            var_name = os.path.splitext(filename)[0].replace('-', '_') + '_json'
            content = f.read().strip()
            json_files_content[var_name] = content.replace('\n', '').replace(' ', '')

def getWebhookScript() -> str:
    with open(os.path.join(os.path.dirname(__file__), "webhook-script.js"), 'r', encoding='utf-8') as f:
        whScript = f.read().strip()
    return whScript
