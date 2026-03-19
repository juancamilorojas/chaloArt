import json
import random

# Status options
STATUS_OPTIONS = ["disponible", "vendido"]

# Lorem ipsum texts
LOREM_ES = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
LOREM_EN = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."

json_path = "src/data/artworks.json"

with open(json_path, 'r', encoding='utf-8') as f:
    artworks = json.load(f)

for artwork in artworks:
    if "description" not in artwork:
        artwork["description"] = {
            "es": LOREM_ES,
            "en": LOREM_EN
        }
    if "status" not in artwork:
        artwork["status"] = random.choice(STATUS_OPTIONS)

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(artworks, f, indent=2, ensure_ascii=False)

print("Placeholder data added successfully.")
