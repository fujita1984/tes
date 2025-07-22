#!/usr/bin/env python3
"""
VPSサーバー用: HSK CSVデータをインポートするスクリプト
"""

import sys
import os
import csv
from sqlalchemy import create_engine, text
from db_mysql import create_mysql_engine

def import_hsk_csv(csv_file_path="hsk.csv"):
    """
    CSVファイルからhsk_wordsテーブルにデータをインポートする
    
    Args:
        csv_file_path (str): CSVファイルのパス
    """
    if not os.path.exists(csv_file_path):
        print(f"❌ CSVファイルが見つかりません: {csv_file_path}")
        return False
        
    try:
        # MySQLエンジンを作成
        engine = create_mysql_engine()
        
        # CSVファイルを読み込み
        with open(csv_file_path, 'r', encoding='utf-8-sig') as csvfile:
            # BOM（Byte Order Mark）対応のためutf-8-sigを使用
            reader = csv.DictReader(csvfile)
            
            # データを準備
            data_to_insert = []
            for row in reader:
            # 実際のCSVの列名に基づいてデータを取得
                data_to_insert.append({
                    'id': int(row['番号']),  # または row['番号'] など実際の列名
                    'chinese': row['中国語'],  # または row['漢字'] など実際の列名
                    'pinyin': row['ピンイン1'],  # または row['ピンイン'] など実際の列名
                    'pinyin_with_tone': row['ピンイン2'],
                    'japanese': row['日本語'],  # または row['意味'] など実際の列名
                    'hsk_level': int(row['level'])  # または row['級'] など実際の列名
                })
            
            print(f"📄 {len(data_to_insert)}件のデータを読み込みました")
            
            # データベースに一括挿入
            with engine.connect() as conn:
                # まず既存のデータを削除（必要に応じて）
                conn.execute(text("DELETE FROM hsk_words"))
                print("🗑️  既存データを削除しました")
                
                # AUTO_INCREMENTをリセット
                conn.execute(text("ALTER TABLE hsk_words AUTO_INCREMENT = 1"))
                print("🔄 AUTO_INCREMENTをリセットしました")
                
                # データを一括挿入
                insert_sql = """
                INSERT INTO hsk_words (id, chinese, pinyin, pinyin_with_tone, japanese_meaning, hsk_level) 
                VALUES (:id, :chinese, :pinyin, :pinyin_with_tone, :japanese_meaning, :hsk_level)
                """
                
                conn.execute(text(insert_sql), data_to_insert)
                conn.commit()
                
                print(f"✅ {len(data_to_insert)}件のデータをインポートしました")
                
                # インポート結果を確認
                result = conn.execute(text("SELECT COUNT(*) as count FROM hsk_words"))
                count = result.fetchone()[0]
                print(f"📊 テーブル内データ件数: {count}件")
                
                # 最初の3件を表示
                result = conn.execute(text("SELECT id, chinese, pinyin, japanese_meaning, hsk_level FROM hsk_words ORDER BY id LIMIT 3"))
                print("\n📋 インポートされたデータ（最初の3件）:")
                for row in result:
                    print(f"  ID:{row[0]} | {row[1]} | {row[2]} | {row[3]} | レベル{row[4]}")
                
    except Exception as e:
        print(f"❌ エラーが発生しました: {e}")
        return False
        
    return True

def main():
    """
    メイン関数
    """
    print("🚀 HSK CSVデータのインポートを開始します...")
    
    # CSVファイルのパスを指定
    csv_file = "hsk.csv"
    
    if import_hsk_csv(csv_file):
        print("✅ HSK CSVデータのインポートが完了しました")
        sys.exit(0)
    else:
        print("❌ HSK CSVデータのインポートに失敗しました")
        sys.exit(1)

if __name__ == "__main__":
    main()
