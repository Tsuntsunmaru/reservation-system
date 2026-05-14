# 予約管理システム

## 概要
社用車・会議室の予約を分単位で管理するシステム  
外部予約と社内予約を統合管理

---

## 機能

- 社用車予約
- 会議室予約
- 分単位予約
- NG時間設定
- 休日設定（土日・手動）
- 管理者機能
- カレンダーUI（ドラッグ予約）

---

## フォルダ構成
reservation-system/
├ backend/
│  ├ app/
│  │  ├ main.py        # FastAPIエントリーポイント
│  │  ├ database.py    # DB接続設定
│  │  ├ models/        # DBモデル定義
│  │  ├ routers/       # APIルーティング
│  │  ├ services/      # ビジネスロジック
│  │  └ core/          # 認証処理
│  │
│  ├ run.py            # サーバー起動スクリプト
│  └ requirements.txt  # 依存ライブラリ
│
├ frontend/
│  ├ index.html        # ユーザー画面
│  ├ admin.html        # 管理画面
│  ├ app.js            # フロント処理
│  └ style.css         # スタイル
│
└ README.md            # このファイル

---

## ⚙️ 起動方法

```bash
cd backend

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt
python run.py
