from gtts import gTTS
from models import Words
from db import SessionLocal
import os
from tqdm import tqdm

# 保存先ディレクトリ
EN_DIR = os.path.join('static', 'audio','words', 'english')
CN_DIR = os.path.join('static', 'audio','words', 'chinese')
os.makedirs(EN_DIR, exist_ok=True)
os.makedirs(CN_DIR, exist_ok=True)

session = SessionLocal()
words = session.query(Words).order_by(Words.id).all()
session.close()

for idx, word in enumerate(tqdm(words, desc='Generating mp3')):
    num = word.id  # idをファイル名に
    # 英語
    if word.english:
        en_path = os.path.join(EN_DIR, f"{num}.mp3")
        tts_en = gTTS(word.english, lang='en')
        tts_en.save(en_path)
    # 中国語
    if word.chinese:
        cn_path = os.path.join(CN_DIR, f"{num}.mp3")
        tts_cn = gTTS(word.chinese, lang='zh-CN')
        tts_cn.save(cn_path)
print("音声ファイルの生成が完了しました。")
