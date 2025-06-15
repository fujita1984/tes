from flask import jsonify
from models import Words, Phrases
from db import SessionLocal
import random

# ...existing code...
@app.route("/api/words")
def api_words():
    session = SessionLocal()
    words = session.query(Words).all()
    session.close()
    # 30件ランダムに選ぶ
    selected = random.sample(words, min(30, len(words)))
    # id, english, japanese, chinese を返す
    return jsonify([
        {"id": w.id, "english": w.english, "japanese": w.japanese, "chinese": w.chinese} for w in selected
    ])

@app.route("/api/phrases")
def api_phrases():
    session = SessionLocal()
    phrases = session.query(Phrases).all()
    session.close()
    selected = random.sample(phrases, min(30, len(phrases)))
    return jsonify([
        {"id": p.id, "english": p.english, "japanese": p.japanese, "chinese": p.chinese}
        for p in selected
    ])