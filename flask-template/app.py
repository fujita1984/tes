from flask import Flask, render_template, jsonify
from models import Words, Phrases
from db import SessionLocal
import random

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("home.html")

@app.route("/game")
def game():
    return render_template("game.html")


@app.route("/api/words")
def api_words():
    session = SessionLocal()
    words = session.query(Words).all()
    session.close()
    selected = random.sample(words, min(10, len(words)))
    return jsonify(
        [
            {"id": w.id, "english": w.english, "japanese": w.japanese, "chinese": w.chinese}
            for w in selected
        ]
    )

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

# app.py の一番下
if __name__ == '__main__':      
    app.run(host='0.0.0.0', port=5000, debug=True)
