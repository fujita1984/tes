# VPSサーバーデプロイメント手順書

## 前提条件
- VPSサーバーにPython 3.7+がインストールされている
- MySQLサーバーが稼働している
- データベースが作成済み（テーブルは未作成でOK）

## デプロイメント手順

### 1. GitHubからプロジェクトを取得
```bash
# プロジェクトをクローン（初回）
git clone https://github.com/fujita1984/tes.git
cd tes/flask-template

# または既存プロジェクトを更新
cd tes
git pull origin main
cd flask-template
```

### 2. 環境変数を設定
`.env`ファイルを作成して、データベース接続情報を設定:

```bash
# .envファイルを作成
nano .env
```

`.env`ファイルの内容:
```
DB_HOST=localhost
DB_NAME=your_database_name
DB_USER=your_username
DB_PASSWORD=your_password
```

### 3. 必要なパッケージをインストール
```bash
# 必要なパッケージをインストール
pip install -r requirements.txt
```

### 4. HSKデータベースをセットアップ

#### オプション A: 統合スクリプトで一括実行（推奨）
```bash
python setup_hsk_database.py
```

#### オプション B: 個別に実行
```bash
# Step 1: テーブル作成
python create_hsk_table.py

# Step 2: CSVデータインポート
python import_hsk_csv.py
```

### 5. Flaskアプリケーションを起動
```bash
# 開発用サーバーで起動
python app.py

# または本番環境用（gunicornを使用する場合）
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### 6. ブラウザでアクセス
```
http://your-server-ip:5000
```

## トラブルシューティング

### データベース接続エラーが発生した場合
1. `.env`ファイルの設定を確認
2. MySQLサーバーが稼働していることを確認
3. データベースとユーザーが作成されていることを確認

### CSVファイルが見つからないエラー
1. `Book1 (5).csv`がプロジェクトルートにあることを確認
2. ファイル名が正確であることを確認

### パッケージインストールエラー
```bash
# pipを最新版に更新
pip install --upgrade pip

# 必要に応じて個別にインストール
pip install flask sqlalchemy pymysql python-dotenv
```

## 確認コマンド

### データベース内容確認
```bash
python -c "
from db_mysql import create_mysql_engine
from sqlalchemy import text
engine = create_mysql_engine()
conn = engine.connect()
result = conn.execute(text('SELECT COUNT(*) FROM hsk_words'))
print(f'総レコード数: {result.fetchone()[0]}')
conn.close()
"
```

### テーブル構造確認
```bash
python -c "
from db_mysql import create_mysql_engine
from sqlalchemy import text
engine = create_mysql_engine()
conn = engine.connect()
result = conn.execute(text('DESCRIBE hsk_words'))
[print(f'{row[0]:15} {row[1]:20}') for row in result]
conn.close()
"
```
