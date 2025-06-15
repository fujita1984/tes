from gtts import gTTS
from models import Phrases
from db import SessionLocal
import os
from tqdm import tqdm

# 保存先ディレクトリ
EN_DIR = os.path.join('static', 'audio','phrases', 'english')
CN_DIR = os.path.join('static', 'audio', 'phrases', 'chinese')
os.makedirs(EN_DIR, exist_ok=True)
os.makedirs(CN_DIR, exist_ok=True)

session = SessionLocal()
phrases = session.query(Phrases).order_by(Phrases.id).all()
session.close()

for idx, phrase in enumerate(tqdm(phrases, desc='Generating mp3')):
    num = idx + 1
    # 英語
    en_path = os.path.join(EN_DIR, f"{num}.mp3")
    tts_en = gTTS(phrase.english, lang='en')
    tts_en.save(en_path)
    # 中国語
    cn_path = os.path.join(CN_DIR, f"{num}.mp3")
    tts_cn = gTTS(phrase.chinese, lang='zh-CN')
    tts_cn.save(cn_path)
print("音声ファイルの生成が完了しました。")
