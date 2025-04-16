import os
import torch
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
from flask import Flask, request, render_template, jsonify
from sentence_transformers import CrossEncoder, SentenceTransformer
import faiss
import numpy as np
import pickle
import pandas as pd
import re
from transformers import pipeline
import json

from flask import Flask, request, jsonify, send_from_directory
import os  # This is needed for the os.path.exists check
from flask_cors import CORS

app = Flask(__name__, static_folder='gastrogenie-client/build', static_url_path='/')
CORS(app)

# Define available models
MODELS = {
    "tiny_llama": {
        "name": "TinyLlama/TinyLlama-1.1B-Chat-v1.0",
        "display_name": "TinyLlama (Fast)",
        "description": "Faster response times but less detailed recommendations",
        "max_tokens": 512
    },
    "deepseek": {
        "name": "deepseek-ai/deepseek-coder-7b-instruct-v1.5",
        "display_name": "DeepSeek 7B (Better Quality)",
        "description": "More comprehensive analysis but slower response times",
        "max_tokens": 768
    }
}

# Initialize the TinyLlama model by default (lazy-loading)
models_cache = {}

def get_model(model_key="tiny_llama"):
    """Lazy-load model to save memory when not in use"""
    if model_key not in MODELS:
        model_key = "tiny_llama"  # Fallback to default model
    
    if model_key not in models_cache:
        model_config = MODELS[model_key]
        print(f"Loading model: {model_config['display_name']}")
        models_cache[model_key] = pipeline(
            "text-generation", 
            model=model_config["name"],
            torch_dtype="auto", 
            max_new_tokens=model_config["max_tokens"]
        )
    
    return models_cache[model_key]

# Default model - we'll load it on-demand now
llm = get_model("tiny_llama")

static_folder = os.path.join(os.path.dirname(__file__), 'static')
with open(os.path.join(static_folder, "recipes_metadata.pkl"), "rb") as f:
    df = pickle.load(f)
index = faiss.read_index(os.path.join(static_folder, "recipes_faiss.index"))
embed_model = SentenceTransformer("all-MiniLM-L6-v2")
cross_encoder = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")

def safe_float(value, default=0.0):
    """Convert value to float safely."""
    try:
        return float(value)
    except:
        return default


def extract_search_tokens(query, model_key="tiny_llama"):
    """
    Use LLM to extract relevant search tokens and parameters from the user query
    Returns a structured representation of the query for more effective search
    """
    current_llm = get_model(model_key)
    
    prompt = f"""
    You are an AI assistant helping to extract relevant search tokens from a recipe query.
    
    User query: "{query}"
    
    Please extract:
    1. Main ingredients (comma-separated)
    2. Cuisine type (if mentioned)
    3. Dietary restrictions (e.g., vegetarian, gluten-free)
    4. Meal type (breakfast, lunch, dinner, dessert, etc.)
    5. Cooking time constraints (e.g., quick, under 30 min)
    6. Special occasion (if mentioned)
    7. Cooking method (if mentioned, e.g., grilled, baked)
    
    Format your response as a JSON object with these keys:
    {{
        "ingredients": [],
        "cuisine": "",
        "dietary": [],
        "meal_type": "",
        "time_constraint": "",
        "occasion": "",
        "cooking_method": "",
        "original_query": ""
    }}
    
    Give only the JSON object, no other text.
    """
    
    try:
        response = current_llm(prompt)[0]['generated_text']
        
        # Try to extract the JSON object from the response
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            json_str = json_match.group(0)
            parsed_data = json.loads(json_str)
            
            # Add the original query
            parsed_data['original_query'] = query
            
            return parsed_data
        else:
            # Fallback if no JSON is found
            return {
                "ingredients": [],
                "cuisine": "",
                "dietary": [],
                "meal_type": "",
                "time_constraint": "",
                "occasion": "",
                "cooking_method": "",
                "original_query": query
            }
    except Exception as e:
        print(f"Error extracting search tokens: {e}")
        # Return default structure if parsing fails
        return {
            "ingredients": [],
            "cuisine": "",
            "dietary": [],
            "meal_type": "",
            "time_constraint": "",
            "occasion": "",
            "cooking_method": "",
            "original_query": query
        }


def generate_llm_response(query, recipe_candidates, model_key="tiny_llama"):
    """
    Generate LLM response that selects the top 5 most relevant recipes
    from the candidates and explains why they're relevant to the user's query
    """
    current_llm = get_model(model_key)
    
    # Format all candidate recipes for the LLM prompt
    recipe_text = ""
    for i, recipe in enumerate(recipe_candidates, 1):
        recipe_text += f"""
        Recipe {i}: {recipe['title']}
        Description: {recipe['description']}
        Time to prepare: {recipe.get('Time', 'N/A')}
        Calories: {recipe.get('Calories', 'N/A')}
        Protein: {recipe.get('Protein', 'N/A')}g
        Cuisine: {recipe.get('Sub_region', 'N/A')}
        """

    # Create the prompt for the LLM to select top 5 recipes and provide reasoning
    prompt = f"""
    You are GastroGenie, a culinary assistant. The user asked: "{query}"
    
    Based on this query, we found these potential recipes:
    {recipe_text}
    
    Task 1: Select the top 5 recipes that best match the user's query. List their numbers only, like this: "1,3,5,6,9"
    
    Task 2: Provide a brief explanation (2-3 sentences) about why these recipes are relevant to the user's query.
    
    Format your response as:
    SELECTED_RECIPES: [list of numbers]
    EXPLANATION: [your explanation]
    """

    # Generate response from LLM
    response = current_llm(prompt)[0]['generated_text']
    
    # Parse the response to extract selected recipes and explanation
    selected_recipes_match = re.search(r'SELECTED_RECIPES:\s*\[?([0-9,\s]+)\]?', response, re.IGNORECASE)
    explanation_match = re.search(r'EXPLANATION:\s*(.*)', response, re.IGNORECASE | re.DOTALL)
    
    # Default values if parsing fails
    selected_indices = [0, 1, 2, 3, 4]  # Default to first 5 recipes
    explanation = "Here are some recipes that match your query."
    
    # Extract selected recipe indices if found
    if selected_recipes_match:
        selected_str = selected_recipes_match.group(1).strip()
        try:
            # Parse the comma-separated indices and convert to 0-indexed
            selected_indices = [int(idx.strip()) - 1 for idx in selected_str.split(',')]
            # Ensure we have valid indices (within range and take at most 5)
            selected_indices = [idx for idx in selected_indices if 0 <= idx < len(recipe_candidates)][:5]
        except:
            pass  # Use default indices if parsing fails
    
    # Extract explanation if found
    if explanation_match:
        explanation = explanation_match.group(1).strip()
    
    # Ensure we have at least some recipes selected
    if not selected_indices:
        selected_indices = list(range(min(5, len(recipe_candidates))))
    
    # Select the recipes based on the indices
    selected_recipes = [recipe_candidates[idx] for idx in selected_indices if idx < len(recipe_candidates)]
    
    return selected_recipes, explanation


def search_recipe(query, k=10, top_n=50, use_token_extraction=True, model_key="tiny_llama"):
    """
    Enhanced search for recipes using FAISS and re-rank using Cross-Encoder.
    Now with option to use LLM token extraction for better query understanding.
    """
    # Process the query with LLM to extract tokens if requested
    if use_token_extraction:
        token_data = extract_search_tokens(query, model_key)
        
        # Build a more structured query from the extracted tokens
        structured_parts = []
        
        # Add ingredients
        if token_data.get("ingredients"):
            ingredients_str = ", ".join(token_data.get("ingredients", []))
            if ingredients_str:
                structured_parts.append(f"Ingredients: {ingredients_str}")
        
        # Add cuisine
        if token_data.get("cuisine"):
            structured_parts.append(f"Cuisine: {token_data['cuisine']}")
        
        # Add dietary restrictions
        if token_data.get("dietary"):
            dietary_str = ", ".join(token_data.get("dietary", []))
            if dietary_str:
                structured_parts.append(f"Dietary: {dietary_str}")
        
        # Add meal type
        if token_data.get("meal_type"):
            structured_parts.append(f"Meal: {token_data['meal_type']}")
        
        # Add time constraint
        if token_data.get("time_constraint"):
            structured_parts.append(f"Time: {token_data['time_constraint']}")
        
        # Add cooking method
        if token_data.get("cooking_method"):
            structured_parts.append(f"Method: {token_data['cooking_method']}")
        
        # Original query is always included
        structured_parts.append(f"Query: {token_data['original_query']}")
        
        # Create enhanced query string
        enhanced_query = " | ".join(structured_parts)
        
        # Use the enhanced query for embedding
        query_for_embedding = enhanced_query
    else:
        # Default behavior: process with regex as before
        protein_match = re.search(r'(\d+)\s*(g|grams?)\s+protein', query, re.I)
        protein_req = float(protein_match.group(1)) if protein_match else None

        time_match = re.search(r'within (\d+) minutes', query, re.I)
        time_req = float(time_match.group(1)) if time_match else None

        region_match = re.search(r'in (\w+) region', query, re.I)
        region_req = region_match.group(1) if region_match else None

        structured_parts = []
        if protein_req: structured_parts.append(f"{protein_req}g protein")
        if time_req: structured_parts.append(f"{time_req} minutes")
        if region_req: structured_parts.append(f"{region_req} cuisine")
        
        structured_parts.append("Original query:")
        structured_parts.append(query)
        
        query_for_embedding = " | ".join(["Recipe search:"] + structured_parts)

    # Generate embedding and search with FAISS
    query_embedding = embed_model.encode([query_for_embedding], convert_to_numpy=True)
    D, I = index.search(query_embedding, top_n)

    # Create candidate recipes with initial scores
    candidates = []
    for idx, distance in zip(I[0], D[0]):
        recipe = df.iloc[idx].to_dict()
        score = 1 / (1 + distance)
        candidates.append((score, recipe))

    # Rerank with cross-encoder
    cross_encoder_inputs = [(query, c[1]["title"] + " | " + c[1]["description"]) for c in candidates]
    cross_scores = cross_encoder.predict(cross_encoder_inputs)

    # Update scores with cross-encoder results
    for i in range(len(candidates)):
        candidates[i] = (cross_scores[i], candidates[i][1])

    # Sort and return top k results
    candidates.sort(reverse=True, key=lambda x: x[0])
    results = [c[1] for c in candidates[:k]]

    return results

@app.route('/api/models', methods=['GET'])
def get_models():
    """Return the list of available models"""
    return jsonify({
        "models": [
            {
                "id": model_id,
                "name": model_info["display_name"],
                "description": model_info["description"]
            } for model_id, model_info in MODELS.items()
        ]
    })

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


@app.route('/api/chat', methods=['POST'])
def chat_api():
    if request.method == 'POST':
        data = request.get_json()
        query = data.get("query", "")
        use_llm = data.get("use_llm", False)  # Get the toggle state
        model_key = data.get("model", "tiny_llama")  # Get selected model, default to TinyLlama
        
        # Validate model selection
        if model_key not in MODELS:
            model_key = "tiny_llama"  # Default to TinyLlama if invalid model requested
        
        if use_llm:
            # Get top 10 recipe recommendations using enhanced token extraction
            recipe_candidates = search_recipe(
                query, 
                k=10, 
                use_token_extraction=True,
                model_key=model_key
            )
            
            # Let LLM select top 5 recipes and generate explanation
            selected_recipes, explanation = generate_llm_response(
                query, 
                recipe_candidates,
                model_key=model_key
            )
            
            # Create a special "recipe" object for the LLM response
            llm_card = {
                "title": "GastroGenie's Recommendation",
                "description": explanation,
                "is_llm_card": True
            }
            
            # Add the LLM card to the beginning of results
            response_data = [llm_card] + selected_recipes
        else:
            # Return default 3 recipe results when toggle is off (without token extraction)
            recipe_results = search_recipe(query, k=3, use_token_extraction=False)
            response_data = recipe_results
        
        return jsonify(response_data)


    
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')