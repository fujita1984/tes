#!/usr/bin/env python3
"""
VPSサーバー用: HSKデータベースセットアップ統合スクリプト
テーブル作成とCSVインポートを一括実行
"""

import sys
import os
from create_hsk_table import create_hsk_table
from import_hsk_csv import import_hsk_csv

def setup_hsk_database():
    """
    HSKデータベースの完全セットアップ
    1. テーブル作成
    2. CSVデータインポート
    """
    print("🚀 HSKデータベースセットアップを開始します...\n")
    
    # Step 1: テーブル作成
    print("Step 1: HSKテーブルを作成中...")
    if not create_hsk_table():
        print("❌ テーブル作成に失敗しました")
        return False
    print("✅ テーブル作成完了\n")
    
    # Step 2: CSVデータインポート
    print("Step 2: CSVデータをインポート中...")
    if not import_hsk_csv():
        print("❌ CSVインポートに失敗しました")
        return False
    print("✅ CSVインポート完了\n")
    
    return True

def main():
    """
    メイン関数
    """
    print("=" * 60)
    print("  HSK タイピングゲーム - データベースセットアップ")
    print("=" * 60)
    
    if setup_hsk_database():
        print("🎉 HSKデータベースセットアップが完了しました！")
        print("\n次のステップ:")
        print("1. Flaskアプリケーションを起動: python app.py")
        print("2. ブラウザでアクセス: http://your-server-ip:5000")
        sys.exit(0)
    else:
        print("❌ HSKデータベースセットアップに失敗しました")
        print("エラーログを確認してください")
        sys.exit(1)

if __name__ == "__main__":
    main()
