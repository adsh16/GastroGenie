# GastroGenie: AI-Powered Recipe Recommendation System

---
<img width="1280" height="707" alt="image" src="https://github.com/user-attachments/assets/124d7a5a-6ab6-485f-916a-63e9417a2e0b" />

---


## 1. Introduction
GastroGenie is an intelligent recipe recommendation system that leverages Natural Language Processing (NLP) and semantic search to provide users with relevant recipes based on specific criteria such as protein content, preparation time, and regional cuisine. The system processes a dataset of 532 recipes and employs a two-stage retrieval architecture combining vector search with cross-encoder re-ranking for improved accuracy.

This project is conducted as an Independent Project under the guidance of Dr. Ganesh Bagler. The students involved in this project are:
- [Aditya Sharma](mailto:aditya22038@iiitd.ac.in)
- [Akshat Raj Saxena](mailto:akshat22054@iiitd.ac.in)
- [Kanishk Kumar Meena](mailto:kanishk22233@iiitd.ac.in)

## 2. Methodology
The system follows a structured pipeline to process user queries and return relevant recipe recommendations.

### Step 1: Data Processing
1. **Data Ingestion**: Load recipe data from a JSON dataset.
2. **Data Cleaning**: Extract key attributes such as title, description, image URL, video link, cuisine type, calories, protein content, and preparation time.
3. **Data Storage**: Store cleaned data in CSV format and as a pandas DataFrame for further processing.

### Step 2: Embedding Generation
1. **Text Preparation**: Construct a structured text representation for each recipe, including all relevant attributes.
2. **Sentence Embedding**: Use `all-MiniLM-L6-v2` from `sentence-transformers` to generate 384-dimensional embeddings for each recipe.
3. **Storage**: Store these embeddings as NumPy arrays for fast retrieval.

### Step 3: Initial Retrieval with FAISS
1. **Vector Indexing**: Store precomputed recipe embeddings in a FAISS `IndexFlatL2` structure.
2. **Query Processing**:
   - User query is embedded using the same transformer model.
   - FAISS retrieves the top 50 most relevant recipes based on L2 distance.

### Step 4: Re-Ranking with Cross-Encoder
1. **Candidate Preparation**: Extract the most relevant recipe descriptions from FAISS search results.
2. **Cross-Encoder Scoring**: Use `cross-encoder/ms-marco-MiniLM-L-6-v2` to compute a relevance score for each (query, recipe) pair.
3. **Sorting**: Sort the recipes based on cross-encoder scores to refine rankings.

### Step 5: Final Output
1. **Select Top Results**: Return the top `k` recipes with metadata including title, description, image, video link, and nutritional details.
2. **Display Results**: Present a user-friendly output with structured recipe information.

## 3. System Architecture

### 3.1 Technical Stack
- **Primary Language**: Python
- **Key Libraries**:
  - `sentence-transformers`: For generating embeddings
  - `faiss`: For efficient similarity search
  - `torch`: For deep learning operations
  - `pandas`: For data manipulation
  - `pickle`: For storing and retrieving precomputed data

### 3.2 Query Processing and Extraction
- **Regex-Based Extraction**:
  - Extracts constraints such as "high protein," "within X minutes," and "in X region."
  - Constructs a structured query to enhance search accuracy.

## 4. Search Algorithm Implementation

### `search_recipe` Function Workflow
1. **Parse user query** using regex to extract constraints.
2. **Enhance the query** with extracted constraints.
3. **Generate query embedding** using the SentenceTransformer model.
4. **Retrieve top 50 results** from FAISS.
5. **Re-rank results** using the cross-encoder.
6. **Return the top `k` results** with comprehensive metadata.

## 5. Performance Analysis
### Strengths
- **Two-Stage Retrieval**: FAISS ensures fast search, while cross-encoder improves ranking quality.
- **Structured Query Processing**: Enhances accuracy by explicitly identifying constraints.
- **Precomputed Embeddings**: Reduces inference time by avoiding real-time embedding generation.

### Limitations
- **Pattern Recognition Constraints**: Current regex-based extraction has limited flexibility.
- **Scalability Considerations**: FAISS flat index may require optimization for larger datasets.
- **No Hard Filtering**: Ranking influences results but does not enforce strict constraints on attributes like time or protein content.

## 6. Conclusion
GastroGenie successfully applies NLP and semantic search to deliver relevant recipe recommendations. By combining FAISS for fast retrieval with a cross-encoder for precise ranking, the system balances efficiency with accuracy. Future improvements could include expanding dietary filters, optimizing query understanding, and implementing more scalable search indexing techniques.
