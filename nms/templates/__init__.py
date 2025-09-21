import os

from .models import *

_json_files_content: dict[str, str] = {}
for filename in os.listdir(os.path.dirname(__file__)):
    if filename.endswith('.json'):
        with open(os.path.join(os.path.dirname(__file__), filename), 'r', encoding='utf-8') as f:
            var_name = os.path.splitext(filename)[0].replace('-', '_') + '_json'
            content = f.read().strip()
            _json_files_content[var_name] = content.replace('\n', '').replace(' ', '')

globals().update(_json_files_content)
