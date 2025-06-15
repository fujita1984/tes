from db import SessionLocal
from models import Phrases

# データベースセッションの作成
phrases_data = [
("I'm sleepy", "眠い", "我困了"),
("I'm hungry", "お腹が空いた", "我饿了"),
("I'm tired", "疲れた", "我累了"),
("I'm going home", "帰る", "我要回家了"),
("It's cold", "寒い", "天气很冷"),
("It's hot", "暑い", "天气很热"),
("I'm thirsty", "喉が渇いた", "我渴了"),
("Let's eat", "食べよう", "我们吃吧"),
("I'm busy", "忙しい", "我很忙"),
("I'm bored", "退屈だ", "我觉得无聊"),
("I'm happy", "嬉しい", "我很高兴"),
("I'm sad", "悲しい", "我很难过"),
("I'm sorry", "ごめんなさい", "对不起"),
("Thank you", "ありがとう", "谢谢"),
("Please wait", "待ってください", "请等一下"),
("I don't know", "分からない", "我不知道"),
("Help me", "助けて", "请帮我"),
("Come here", "ここに来て", "过来吧"),
("Go away", "あっちへ行け", "走开"),
("I'm late", "遅れた", "我迟到了"),
("Good morning", "おはよう", "早上好"),
("Good night", "おやすみ", "晚安"),
("See you", "またね", "再见"),
("Take care", "気をつけて", "保重"),
("I love you", "愛してる", "我爱你"),
("Be quiet", "静かにして", "请安静"),
("Stop it", "やめて", "别这样"),
("Let's go", "行こう", "我们走吧"),
("Wait a minute", "ちょっと待って", "等一下"),
("What time?", "何時？", "几点？"),
("How much?", "いくら？", "多少钱？"),
("Where is it?", "どこ？", "在哪里？"),
("I'm lost", "迷った", "我迷路了"),
("I'm sick", "具合が悪い", "我生病了"),
("I feel good", "気持ちいい", "我感觉很好"),
("I understand", "分かる", "我明白了"),
("I don't understand", "分からない", "我不明白"),
("I agree", "賛成", "我同意"),
("I disagree", "反対", "我不同意"),
("That's wrong", "違う", "那错了"),
("I'm full", "お腹いっぱい", "我吃饱了"),
("I'm free", "暇だ", "我有空"),
("I'm okay", "大丈夫", "我还好"),
("I'm nervous", "緊張している", "我很紧张"),
("I'm excited", "ワクワクしている", "我很兴奋"),
("I'm scared", "怖い", "我很害怕"),
("It's easy", "簡単だ", "很简单"),
("It's difficult", "難しい", "很难"),
("It's fun", "楽しい", "很好玩"),
("It's boring", "つまらない", "很无聊"),
("I feel sick", "気分が悪い", "我感觉不舒服"),
("I want water", "水が飲みたい", "我想喝水"),
("I want to eat", "食べたい", "我想吃东西"),
("I want to sleep", "寝たい", "我想睡觉"),
("I want to go out", "出かけたい", "我想出去"),
("I want to stay home", "家にいたい", "我想待在家里"),
("I'm busy now", "今忙しい", "我现在很忙"),
("Call me later", "後で電話してね", "你等会儿打给我"),
("See you tomorrow", "また明日", "明天见"),
("See you soon", "またすぐに", "回头见"),
("I will try", "やってみる", "我会试试看"),
("I can't do it", "できない", "我做不到"),
("I can do it", "できる", "我能做到"),
("Wait for me", "待ってて", "等我一下"),
("Hurry up", "急いで", "快一点"),
("Slow down", "ゆっくり", "慢一点"),
("That's funny", "面白い", "真好笑"),
("That's strange", "変だ", "真奇怪"),
("That's important", "大事だ", "这很重要"),
("Good job", "よくやった", "干得好"),
("Be careful", "気をつけて", "请小心"),
("Don't worry", "心配しないで", "别担心"),
("It's okay", "大丈夫", "没关系")
]

def insert_phrases(session):
    for i, (eng, jp, cn) in enumerate(phrases_data):
        phrase = Phrases(english=eng, japanese=jp, chinese=cn)
        session.add(phrase)
    session.commit()

if __name__ == "__main__":
    session = SessionLocal()
    insert_phrases(session)
    session.close()
    print("フレーズ100件を投入しました。")
