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

app = Flask(__name__)

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
        results = search_recipe(query)
        return jsonify(results)
    return render_template('chat.html')

if __name__ == '__main__':
    app.run()