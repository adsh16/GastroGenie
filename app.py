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

app = Flask(__name__)

# After loading your other models
llm = pipeline("text-generation", model="TinyLlama/TinyLlama-1.1B-Chat-v1.0", max_new_tokens=512)

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


def generate_llm_response(query, recipe_results):
    """Generate conversational response using LLM"""
    
    # Format recipe results for the LLM prompt
    recipe_text = ""
    for i, recipe in enumerate(recipe_results, 1):
        recipe_text += f"""
        Recipe {i}: {recipe['title']}
        Description: {recipe['description']}
        Time to prepare: {recipe.get('total_time', 'N/A')} minutes
        Calories: {recipe.get('Calories', 'N/A')}
        Protein: {recipe.get('Protein', 'N/A')}g
        Cuisine: {recipe.get('Sub_region', 'N/A')}
        """

    # Create the prompt for the LLM
    prompt = f"""
    You are GastroGenie, a culinary assistant. The user asked: {query}
    Based on this query, we found these recipes:
    {recipe_text}

    Provide a brief, helpful explanation about these recipes in 2-3 sentences.
    """

    # Generate response from LLM
    response = llm(prompt)[0]['generated_text']
    
    # Extract just the assistant's response (removing the prompt)
    assistant_response = response.split("sentences.")[-1].strip()
    
    return assistant_response

def search_recipe(query, k=3, top_n=50):
    """Search for recipes using FAISS and re-rank using Cross-Encoder."""

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

    structured_query = " | ".join(["Recipe search:"] + structured_parts + ["Original query:", query])

    query_embedding = embed_model.encode([structured_query], convert_to_numpy=True)

    D, I = index.search(query_embedding, top_n)

    candidates = []
    for idx, distance in zip(I[0], D[0]):
        recipe = df.iloc[idx].to_dict()
        score = 1 / (1 + distance)
        candidates.append((score, recipe))

    cross_encoder_inputs = [(query, c[1]["title"] + " | " + c[1]["description"]) for c in candidates]

    cross_scores = cross_encoder.predict(cross_encoder_inputs)

    for i in range(len(candidates)):
        candidates[i] = (cross_scores[i], candidates[i][1])

    candidates.sort(reverse=True, key=lambda x: x[0])
    results = [c[1] for c in candidates[:k]]

    return results

@app.route('/', methods=['GET', 'POST'])
def chat():
    if request.method == 'POST':
        data = request.get_json()
        query = data.get("query", "")
        
        # Get recipe recommendations
        recipe_results = search_recipe(query)
        
        # Generate LLM response
        llm_text = generate_llm_response(query, recipe_results)
        
        # Create a special "recipe" object for the LLM response that will render as a card
        llm_card = {
            "title": "GastroGenie's Recommendation",
            "description": llm_text,
            "is_llm_card": True  # Special flag we'll use for styling
        }
        
        # Add the LLM card to the beginning of results
        response_data = [llm_card] + recipe_results
        
        return jsonify(response_data)
    return render_template('chat.html')

if __name__ == '__main__':
    app.run()