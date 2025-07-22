#!/usr/bin/env python3
"""
VPSサーバー用: データベース接続とデータ整合性確認スクリプト
"""

import sys
import os
from sqlalchemy import create_engine, text
from db_mysql import create_mysql_engine

def test_database_connection():
    """
    データベース接続をテストする
    """
    try:
        engine = create_mysql_engine()
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            if result.fetchone():
                print("✅ データベース接続成功")
                return True
    except Exception as e:
        print(f"❌ データベース接続エラー: {e}")
        return False

def test_hsk_table_exists():
    """
    hsk_wordsテーブルの存在確認
    """
    try:
        engine = create_mysql_engine()
        with engine.connect() as conn:
            result = conn.execute(text("SHOW TABLES LIKE 'hsk_words'"))
            if result.fetchone():
                print("✅ hsk_wordsテーブル存在確認")
                return True
            else:
                print("❌ hsk_wordsテーブルが存在しません")
                return False
    except Exception as e:
        print(f"❌ テーブル確認エラー: {e}")
        return False

def test_data_integrity():
    """
    データの整合性確認
    """
    try:
        engine = create_mysql_engine()
        with engine.connect() as conn:
            # レコード数確認
            result = conn.execute(text("SELECT COUNT(*) as count FROM hsk_words"))
            count = result.fetchone()[0]
            print(f"📊 総レコード数: {count}")
            
            # HSKレベル別の分布確認
            result = conn.execute(text("SELECT hsk_level, COUNT(*) as count FROM hsk_words GROUP BY hsk_level ORDER BY hsk_level"))
            print("📊 HSKレベル別分布:")
            total_by_level = 0
            for row in result:
                print(f"  レベル {row[0]}: {row[1]}件")
                total_by_level += row[1]
            
            if total_by_level == count:
                print("✅ データ整合性確認完了")
            else:
                print("❌ データに不整合があります")
                return False
                
            # サンプルデータ表示
            result = conn.execute(text("SELECT id, chinese, pinyin, japanese, hsk_level FROM hsk_words ORDER BY id LIMIT 5"))
            print("\n📋 サンプルデータ（最初の5件）:")
            for row in result:
                print(f"  ID:{row[0]:3} | {row[1]:8} | {row[2]:15} | {row[3]:15} | レベル{row[4]}")
                
            return True
            
    except Exception as e:
        print(f"❌ データ整合性確認エラー: {e}")
        return False

def test_audio_files():
    """
    音声ファイルの存在確認
    """
    audio_dir = "static/audio/chinese"
    if not os.path.exists(audio_dir):
        print(f"❌ 音声ディレクトリが存在しません: {audio_dir}")
        return False
        
    audio_files = [f for f in os.listdir(audio_dir) if f.endswith('.mp3')]
    print(f"🎵 音声ファイル数: {len(audio_files)}")
    
    if len(audio_files) > 0:
        print("✅ 音声ファイル確認完了")
        return True
    else:
        print("❌ 音声ファイルが見つかりません")
        return False

def main():
    """
    統合テスト実行
    """
    print("=" * 60)
    print("  HSK データベース整合性テスト")
    print("=" * 60)
    
    tests = [
        ("データベース接続", test_database_connection),
        ("テーブル存在確認", test_hsk_table_exists),
        ("データ整合性", test_data_integrity),
        ("音声ファイル", test_audio_files)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🧪 {test_name}をテスト中...")
        if test_func():
            passed += 1
        else:
            print(f"❌ {test_name}でエラーが発生しました")
    
    print("\n" + "=" * 60)
    print(f"📊 テスト結果: {passed}/{total} 通過")
    
    if passed == total:
        print("🎉 全てのテストに合格しました！HSKアプリケーションは正常に動作します。")
        sys.exit(0)
    else:
        print("❌ 一部のテストに失敗しました。問題を修正してください。")
        sys.exit(1)

if __name__ == "__main__":
    main()
