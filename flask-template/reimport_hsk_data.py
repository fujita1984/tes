#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
HSKテーブルを空にしてCSVから再インポートするプログラム
"""

import pandas as pd
from db_mysql import get_mysql_session
from models import HskWords
import traceback

def reimport_hsk_data():
    """
    HSKテーブルを空にしてCSVから再インポートする
    """
    try:
        # MySQLセッションを取得
        session, engine = get_mysql_session()
        
        print("🗑️  既存のHSKデータを削除中...")
        # 既存のHSKデータをすべて削除
        deleted_count = session.query(HskWords).delete()
        session.commit()
        print(f"✅ {deleted_count}件のデータを削除しました")
        
        print("📖 CSVファイルを読み込み中...")
        # CSVファイルを読み込み
        df = pd.read_csv('hsk.csv', encoding='utf-8')
        print(f"📊 CSVから {len(df)} 行のデータを読み込みました")
        
        # カラム名を確認・表示
        print(f"📋 CSVのカラム: {list(df.columns)}")
        
        print("💾 データベースに挿入中...")
        inserted_count = 0
        
        # 各行をHskWordsテーブルに挿入
        for index, row in df.iterrows():
            try:
                # CSVの各行からHskWordsオブジェクトを作成
                hsk_word = HskWords(
                    chinese=str(row['中国語']).strip(),
                    pinyin=str(row['ピンイン1']).strip(),
                    pinyin_with_tone=str(row['ピンイン2']).strip(), 
                    japanese_meaning=str(row['日本語']).strip(),
                    hsk_level=int(row['level'])
                )
                
                session.add(hsk_word)
                inserted_count += 1
                
                # 50件ごとにコミット（パフォーマンス向上のため）
                if inserted_count % 50 == 0:
                    session.commit()
                    print(f"  ✅ {inserted_count} 件挿入完了...")
                    
            except Exception as e:
                print(f"  ❌ 行 {index + 2} でエラー: {e}")
                print(f"  📝 データ: {row.to_dict()}")
                continue
        
        # 残りのデータをコミット
        session.commit()
        session.close()
        
        print(f"🎉 インポート完了! 合計 {inserted_count} 件のHSKデータをインポートしました")
        
        # インポート結果を確認
        print("\n📈 インポート結果の確認:")
        session, engine = get_mysql_session()
        
        # レベル別の件数を表示
        for level in [1, 2]:
            count = session.query(HskWords).filter(HskWords.hsk_level == level).count()
            print(f"  HSK レベル {level}: {count} 件")
            
        total_count = session.query(HskWords).count()
        print(f"  合計: {total_count} 件")
        
        session.close()
        
        return True
        
    except FileNotFoundError:
        print("❌ エラー: hsk.csv ファイルが見つかりません")
        print("   現在のディレクトリにhsk.csvファイルがあることを確認してください")
        return False
        
    except Exception as e:
        print(f"❌ エラーが発生しました: {e}")
        print("📝 詳細なエラー情報:")
        print(traceback.format_exc())
        if 'session' in locals():
            session.rollback()
            session.close()
        return False

def main():
    """
    メイン関数
    """
    print("🚀 HSKデータの再インポートを開始します...\n")
    
    # 確認メッセージ
    confirmation = input("⚠️  既存のHSKデータがすべて削除されます。続行しますか？ (y/N): ")
    if confirmation.lower() not in ['y', 'yes', 'はい']:
        print("❌ インポート処理をキャンセルしました")
        return
    
    # 再インポート実行
    success = reimport_hsk_data()
    
    if success:
        print("\n✅ HSKデータの再インポートが正常に完了しました！")
        print("🎮 HSKタイピングゲームで新しいデータをお試しください")
    else:
        print("\n❌ インポート処理が失敗しました")
        print("🔍 エラーメッセージを確認して問題を解決してください")

if __name__ == "__main__":
    main()
