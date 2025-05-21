import json
import random

def assign_sunlight(score):
    if score >= 80:
        return "High"
    elif score >= 60:
        return "Medium-High"
    elif score >= 40:
        return "Medium"
    elif score >= 20:
        return "Medium-Low"
    else:
        return "Low"

# Load your BBMP file
with open('BBMP.geojson', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Assign sunlight data
for feature in data['features']:
    score = random.randint(10, 100)
    feature['properties']['sunlight_score'] = score
    feature['properties']['category'] = assign_sunlight(score)

# Save the updated file
with open('BBMP_with_sunlight.geojson', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print("Saved as BBMP_with_sunlight.geojson")
