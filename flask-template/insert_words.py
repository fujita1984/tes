from db import SessionLocal
from models import Words, Categories

# カテゴリ例
categories = [
    "Food", "Animal", "Color", "Everyday Items", "Nature", "IT exam"
]

# カテゴリを作成
category_objs = []
def insert_categories(session):
    for name in categories:
        cat = Categories(name=name)
        session.add(cat)
        category_objs.append(cat)
    session.commit()

words_data = [
     # 食べ物 (1)
    ("apple", "りんご", "苹果", 1),
    ("banana", "バナナ", "香蕉", 1),
    ("grape", "ぶどう", "葡萄", 1),
    ("orange", "オレンジ", "橙子", 1),
    ("peach", "もも", "桃子", 1),
    ("watermelon", "すいか", "西瓜", 1),
    ("strawberry", "いちご", "草莓", 1),
    ("cherry", "さくらんぼ", "樱桃", 1),
    ("lemon", "レモン", "柠檬", 1),
    ("pineapple", "パイナップル", "菠萝", 1),
    ("carrot", "にんじん", "胡萝卜", 1),
    ("potato", "じゃがいも", "土豆", 1),
    ("onion", "たまねぎ", "洋葱", 1),
    ("rice", "ごはん", "米饭", 1),
    ("bread", "パン", "面包", 1),
    ("egg", "たまご", "鸡蛋", 1),
    ("meat", "肉", "肉", 1),
    ("fish", "魚", "鱼", 1),
    ("milk", "牛乳", "牛奶", 1),
    ("cheese", "チーズ", "奶酪", 1),

    # 動物 (2)
    ("cat", "猫", "猫", 2),
    ("dog", "犬", "狗", 2),
    ("bird", "鳥", "鸟", 2),
    ("rabbit", "うさぎ", "兔子", 2),
    ("horse", "馬", "马", 2),
    ("cow", "牛", "牛", 2),
    ("pig", "豚", "猪", 2),
    ("sheep", "羊", "羊", 2),
    ("lion", "ライオン", "狮子", 2),
    ("tiger", "トラ", "老虎", 2),
    ("elephant", "象", "大象", 2),
    ("bear", "くま", "熊", 2),
    ("monkey", "さる", "猴子", 2),
    ("panda", "パンダ", "熊猫", 2),
    ("giraffe", "キリン", "长颈鹿", 2),
    ("zebra", "シマウマ", "斑马", 2),
    ("fox", "きつね", "狐狸", 2),
    ("wolf", "おおかみ", "狼", 2),
    ("mouse", "ねずみ", "老鼠", 2),
    ("duck", "アヒル", "鸭子", 2),

    # 色 (3)
    ("red", "赤", "红色", 3),
    ("blue", "青", "蓝色", 3),
    ("green", "緑", "绿色", 3),
    ("yellow", "黄色", "黄色", 3),
    ("black", "黒", "黑色", 3),
    ("white", "白", "白色", 3),
    ("pink", "ピンク", "粉红色", 3),
    ("orange", "オレンジ", "橙色", 3),
    ("purple", "紫", "紫色", 3),
    ("brown", "茶色", "棕色", 3),

    # 日常用品 (4)
    ("chair", "いす", "椅子", 4),
    ("table", "テーブル", "桌子", 4),
    ("pen", "ペン", "笔", 4),
    ("book", "本", "书", 4),
    ("cup", "コップ", "杯子", 4),
    ("bag", "かばん", "包", 4),
    ("phone", "電話", "电话", 4),
    ("clock", "時計", "钟", 4),
    ("mirror", "鏡", "镜子", 4),
    ("toothbrush", "歯ブラシ", "牙刷", 4),
    ("soap", "石けん", "肥皂", 4),
    ("towel", "タオル", "毛巾", 4),
    ("shoes", "くつ", "鞋", 4),
    ("hat", "帽子", "帽子", 4),
    ("key", "かぎ", "钥匙", 4),

    # 自然 (5)
    ("sun", "太陽", "太阳", 5),
    ("moon", "月", "月亮", 5),
    ("star", "星", "星星", 5),
    ("sky", "空", "天空", 5),
    ("cloud", "雲", "云", 5),
    ("rain", "雨", "雨", 5),
    ("snow", "雪", "雪", 5),
    ("wind", "風", "风", 5),
    ("tree", "木", "树", 5),
    ("flower", "花", "花", 5),
    ("mountain", "山", "山", 5),
    ("river", "川", "河", 5),
    ("sea", "海", "海", 5),
    ("grass", "草", "草", 5),
    ("stone", "石", "石头", 5),

    # 情報試験 (6)
    ("credential", "認証情報", "凭证", 6),
    ("authentication", "認証（本人確認）", "身份验证", 6),
    ("authorization", "認可", "授权", 6),
    ("identity", "身元", "身份", 6),
    ("certificate", "証明書", "证书", 6),
    ("vulnerability", "脆弱性", "漏洞", 6),
    ("exploit", "攻撃", "攻击", 6),
    ("signature", "署名", "签名", 6),
    ("revocation", "失効", "吊销", 6),
    ("strict", "厳密な", "严格", 6),
    ("statement", "声明", "声明", 6),
    ("verification", "検証", "验证", 6),
    ("authority", "権限", "权限", 6),
    ("registration", "登録", "注册", 6),
    ("assertion", "主張", "断言", 6),
    ("foundation", "基盤", "基础", 6),
    ("transport", "転送", "传输", 6),
    ("certification", "第三者認証", "认证", 6),
    ("enhance", "強化する", "增强", 6),
    ("grant", "付与", "授予", 6),
    ("auth", "認証", "认证", 6),
    ("detection", "検出", "检测", 6),
    ("intrusion", "侵入", "入侵", 6),
    ("prevention", "防止", "防止", 6),
    ("redundancy", "冗長性", "冗余", 6),
    ("maturity", "成熟", "成熟", 6),
    ("avoidance", "回避", "避免", 6),
    ("proposal", "提案", "提议", 6),
    ("accept", "同意", "接受", 6)
]

def insert_words(session):
    for i, (eng, jp, cn, cat_id) in enumerate(words_data):
        cat = category_objs[cat_id - 1]
        word = Words(english=eng, japanese=jp, chinese=cn, category=cat)
        session.add(word)
    session.commit()

if __name__ == "__main__":
    session = SessionLocal()
    insert_categories(session)
    insert_words(session)
    session.close()
    print("カテゴリと単語を投入しました。")
