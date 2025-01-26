import requests
import json
import math
from dotenv import load_dotenv
import os

INF = math.inf
# Load environment variables
load_dotenv()


# Get variables from .env
max_indian_recipes = os.getenv('max_indian_recipes')
API_KEY = os.getenv('API_KEY')

url = f"https://cosylab.iiitd.edu.in/recipe-search/regions?searchText=Indian Subcontinent&pageSize={max_indian_recipes}"

headers = {
    'x-API-key': API_KEY
}

payload = {}

# Fetch data from API
response = requests.request("GET", url, headers=headers, data=payload)

# Parse JSON response
recipe_data = response.json()

# Save to JSON file with nice formatting
with open('recipes.json', 'w', encoding='utf-8') as f:
    json.dump(recipe_data, f, indent=4, ensure_ascii=False)

print("Recipe data has been saved to recipes.json")

#  checking how many recipes are there
set_of_recipes_index = set()

#  all recipes shoul have unique recipe_index
for i in range(len(recipe_data["payload"]["data"])):
    if recipe_data["payload"]["data"][i]["Recipe_id"] not in set_of_recipes_index:
        set_of_recipes_index.add(recipe_data["payload"]["data"][i]["Recipe_id"])
    else:
        print(("Duplicate recipe index found:") + str(recipe_data["payload"]["data"][i]["Recipe_id"]))

print("These many total recipes found: " + str(len(set_of_recipes_index)))