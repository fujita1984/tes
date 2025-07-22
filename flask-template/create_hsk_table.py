#!/usr/bin/env python3
"""
VPSサーバー用: HSKテーブルを作成するスクリプト
"""

import sys
import os
from sqlalchemy import create_engine, text
from db_mysql import create_mysql_engine

def create_hsk_table():
    """
    hsk_wordsテーブルを作成する
    """
    try:
        # MySQLエンジンを作成
        engine = create_mysql_engine()
        
        # テーブル作成SQL
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS hsk_words (
            id INT AUTO_INCREMENT PRIMARY KEY,
            chinese VARCHAR(100) NOT NULL COMMENT '中国語',
            pinyin VARCHAR(200) NOT NULL COMMENT 'ピンイン',
            japanese VARCHAR(200) NOT NULL COMMENT '日本語意味',
            hsk_level INT NOT NULL COMMENT 'HSKレベル',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_hsk_level (hsk_level),
            INDEX idx_chinese (chinese),
            INDEX idx_pinyin (pinyin)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='HSK単語テーブル';
        """
        
        # テーブルを作成
        with engine.connect() as conn:
            conn.execute(text(create_table_sql))
            conn.commit()
            print("✅ hsk_wordsテーブルが正常に作成されました")
            
            # テーブルが存在することを確認
            result = conn.execute(text("SHOW TABLES LIKE 'hsk_words'"))
            if result.fetchone():
                print("✅ テーブルの存在確認完了")
                
                # テーブル構造を表示
                result = conn.execute(text("DESCRIBE hsk_words"))
                print("\n📋 テーブル構造:")
                for row in result:
                    print(f"  {row[0]:15} {row[1]:20} {row[2]:5} {row[3]:5}")
            else:
                print("❌ テーブルの作成に失敗しました")
                return False
                
    except Exception as e:
        print(f"❌ エラーが発生しました: {e}")
        return False
        
    return True

def main():
    """
    メイン関数
    """
    print("🚀 HSKテーブル作成を開始します...")
    
    if create_hsk_table():
        print("✅ HSKテーブルの作成が完了しました")
        sys.exit(0)
    else:
        print("❌ HSKテーブルの作成に失敗しました")
        sys.exit(1)

if __name__ == "__main__":
    main()
