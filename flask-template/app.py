from flask import Flask, render_template, jsonify, request
from models import Words, Categories
from db import SessionLocal
import random
import re
from sqlalchemy.orm import joinedload  # 追加

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("home.html")

@app.route("/game")
def game():
    return render_template("game.html")
@app.route("/memo-IT-exam")
def memo_it_exam():
    return render_template("memo-IT-exam.html")

@app.route("/api/word_categories")
def api_word_categories():
    session = SessionLocal()
    # カテゴリ名一覧を取得（重複なし）
    categories = session.query(Categories.name).distinct().all()
    session.close()
    cat_list = [c[0] for c in categories if c[0]]
    cat_list.sort()
    return jsonify(cat_list)

@app.route("/api/words")
def api_words():
    try:
        session = SessionLocal()
        category = request.args.get('category', default=None, type=str)
        q = session.query(Words).options(joinedload(Words.category))  # joinedloadを追加
        if category and category != 'ALL':
            q = q.join(Categories, Words.category_id == Categories.id).filter(Categories.name == category)
        words = q.all()
        session.close()
        limit = request.args.get('limit', default=10, type=str)
        if not re.fullmatch(r"\d{1,3}", limit):
            limit = 10
        limit = int(limit)
        if limit < 1 or limit > 100:
            limit = 10
        selected = random.sample(words, min(limit, len(words)))
        return jsonify([
            {"id": w.id, "english": w.english, "japanese": w.japanese, "chinese": w.chinese, "category": w.category.name if w.category else None} for w in selected
        ])
    except Exception as e:
        import traceback
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

# app.py の一番下
if __name__ == '__main__':      
    app.run(host='0.0.0.0', port=5000, debug=True)
