from flask import Flask, render_template, jsonify, request
from models import Words, Categories, HskWords
from db_mysql import get_mysql_session
import random
import re
import os
from sqlalchemy.orm import joinedload  # 追加

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("home.html")

@app.route("/word-karuta")
def word_karuta():
    return render_template("word-karuta.html")
@app.route("/word")
def word():
    return render_template("word.html")

@app.route("/hsk-type")
def hsk_type():
    return render_template("hsk-type.html")
@app.route("/api/word_categories")
def api_word_categories():
    session, engine = get_mysql_session()
    # カテゴリ名一覧を取得（重複なし）
    categories = session.query(Categories.name).distinct().all()
    session.close()
    cat_list = [c[0] for c in categories if c[0]]
    cat_list.sort()
    return jsonify(cat_list)

@app.route("/api/words")
def api_words():
    try:
        session, engine = get_mysql_session()
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

@app.route("/api/hsk_words")
def api_hsk_words():
    try:
        # MySQLから取得
        session, engine = get_mysql_session()
        level = request.args.get('level', default=1, type=int)
        limit = request.args.get('limit', type=int)  # limitがNoneの場合は全て取得
        
        # HSKレベルでフィルタリング
        words = session.query(HskWords).filter(HskWords.hsk_level == level).all()
        session.close()
        
        # limitが指定されている場合のみランダムに選択
        if limit is not None and limit < len(words):
            selected = random.sample(words, limit)
        else:
            # limitが未指定またはlimitが総数以上の場合は全て返す
            selected = words
        
        return jsonify([
            {
                "id": w.id,
                "chinese": w.chinese,
                "pinyin": w.pinyin,
                "pinyin_with_tone": w.pinyin_with_tone,
                "japanese_meaning": w.japanese_meaning,
                "hsk_level": w.hsk_level
            } for w in selected
        ])
    except Exception as e:
        import traceback
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

# app.py の一番下
if __name__ == '__main__':      
    app.run(host='0.0.0.0', port=5000, debug=True)
