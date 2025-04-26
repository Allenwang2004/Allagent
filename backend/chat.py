from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
import fitz  # PyMuPDF for PDF parsing
from docx import Document
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploaded_files"
OLLAMA_API = "http://localhost:11434/api/generate"

# === Document Loading ===
def extract_text_from_pdf(filepath):
    text = ""
    doc = fitz.open(filepath)
    for page in doc:
        text += page.get_text()
    return text

def extract_text_from_docx(filepath):
    text = ""
    doc = Document(filepath)
    for para in doc.paragraphs:
        text += para.text + "\n"
    return text

def split_into_chunks(text, chunk_size=500, overlap=50):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap
    return chunks

def load_documents():
    documents = []
    for filename in os.listdir(UPLOAD_FOLDER):
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        if filename.endswith(".txt"):
            with open(filepath, "r", encoding="utf-8") as f:
                text = f.read()
        elif filename.endswith(".pdf"):
            text = extract_text_from_pdf(filepath)
        elif filename.endswith(".docx"):
            text = extract_text_from_docx(filepath)
        else:
            continue
        chunks = split_into_chunks(text)
        documents.extend(chunks)
    return documents

# === Embedding & FAISS ===
embed_model = SentenceTransformer("all-MiniLM-L6-v2")
faiss_index = None
faiss_docs = []

def build_faiss_index(docs):
    global faiss_index, faiss_docs
    embeddings = embed_model.encode(docs)
    faiss_index = faiss.IndexFlatL2(embeddings.shape[1])
    faiss_index.add(np.array(embeddings))
    faiss_docs = docs

def search_similar_docs(query, top_k=3):
    if faiss_index is None:
        return []
    query_vec = embed_model.encode([query])
    D, I = faiss_index.search(np.array(query_vec), top_k)
    return [faiss_docs[i] for i in I[0] if i < len(faiss_docs)]

# === Ollama LLM Call ===
def call_llm(prompt):
    payload = {
        "model": "llama3",
        "prompt": prompt,
        "stream": False
    }
    res = requests.post(OLLAMA_API, json=payload)
    res.raise_for_status()
    return res.json()["response"]

# === Flask Routes ===
@app.route("/api/chat", methods=["POST"])
def chat():
    try:
        data = request.json
        user_input = data.get("message", "")
        if not user_input:
            return jsonify({"error": "Missing message"}), 400

        # Search related docs
        related_docs = search_similar_docs(user_input)

        if related_docs:
            context = "\n\n".join(related_docs)
            prompt = f"""
你是一個嚴謹的 AI 助理，僅能依據提供的資料回答問題。
如果資料中找不到答案，請誠實回答「資料中無法找到答案」。

以下是資料：
{context}

問題：{user_input}
"""
        else:
            prompt = f"直接回答問題：{user_input}"

        reply = call_llm(prompt)
        return jsonify({"reply": reply})

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500

@app.route("/api/build_index", methods=["POST"])
def build_index_endpoint():
    try:
        docs = load_documents()
        build_faiss_index(docs)
        return jsonify({"status": "Index built", "documents": len(docs)})
    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # On start, load docs and build index
    docs = load_documents()
    build_faiss_index(docs)
    app.run(debug=True, port=5001)

