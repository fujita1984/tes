import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# 環境変数を読み込み
load_dotenv()

# MySQL用のデータベース設定
user = os.getenv('DB_USER')
password = os.getenv('DB_PASSWORD')
host = os.getenv('DB_HOST')
database = os.getenv('DB_NAME')

def create_mysql_engine():
    """
    MySQL用のSQLAlchemyエンジンを作成
    """
    # MySQL接続文字列を構築
    connection_string = f"mysql+pymysql://{user}:{password}@{host}/{database}?charset=utf8mb4"

    print(f"Connecting to MySQL: {host}, Database: {database}, User: {user}")

    engine = create_engine(
        connection_string,
        echo=True,  # SQLクエリをログ出力
        pool_pre_ping=True,
        pool_recycle=3600
    )
    
    return engine

# セッションファクトリーを作成
def get_mysql_session():
    engine = create_mysql_engine()
    Session = sessionmaker(bind=engine)
    return Session(), engine
