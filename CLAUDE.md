# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

mabl-cosmeは、生成AI系コスメ/ビジュアルSaaSを模したE2Eテストデモ用アプリケーション。mablとLLMによる「UIコード生成」「自動テスト生成」のサンプル題材として使用される。

## コマンド

```bash
# 開発（フロントエンド + バックエンド同時起動）
npm run dev:all

# 開発（フロントエンドのみ - http://localhost:5173）
npm run dev

# 開発（バックエンドAPIサーバーのみ - http://localhost:3000）
npm run dev:server

# ビルド
npm run build

# 本番モードで起動（ビルド後）
npm start

# ビルド + プレビュー
npm run preview

# Lint
npm run lint

# Docker で起動
docker compose up -d --build
```

## 環境変数

`.env`ファイルを作成し、以下を設定（`.env.example`を参照）:

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `OPENAI_API_KEY` | OpenAI APIキー（背景生成機能に必要） | Yes |
| `AUTH_USERNAME` | ログイン用ユーザー名（デフォルト: `demo`） | No |
| `AUTH_PASSWORD` | ログイン用パスワード（デフォルト: `demo123`） | No |
| `JWT_SECRET` | JWT署名用シークレット | No |
| `BASIC_AUTH_USERNAME` | Basic認証ユーザー名（オプション） | No |
| `BASIC_AUTH_PASSWORD` | Basic認証パスワード（オプション） | No |

## アーキテクチャ

```
├── src/
│   ├── App.tsx              # メインReactコンポーネント
│   ├── main.tsx             # Reactエントリーポイント
│   ├── components/          # UIコンポーネント
│   │   ├── AuthSection.tsx  # ログイン画面
│   │   ├── Header.tsx       # ヘッダー
│   │   ├── ImageEditor.tsx  # 画像編集
│   │   └── Gallery.tsx      # ギャラリー
│   ├── contexts/            # React Context
│   │   ├── AuthContext.tsx  # 認証状態管理（JWTトークン）
│   │   └── LanguageContext.tsx # 多言語対応
│   ├── services/            # API呼び出し
│   └── i18n/                # 翻訳定義
├── server/
│   ├── index.js             # Expressサーバー（静的ファイル配信 + API）
│   ├── proxy.js             # APIルート (/api/login, /api/openai)
│   └── auth.js              # JWT認証ロジック
```

### 認証フロー

1. **ログイン**: `POST /api/login` でユーザー名・パスワードを送信
2. **トークン取得**: サーバーがJWTトークンを返却
3. **API呼び出し**: `Authorization: Bearer <token>` ヘッダーを付与

```
POST /api/login
  Request:  { "username": "demo", "password": "demo123" }
  Response: { "token": "eyJhbG..." }

POST /api/openai
  Headers:  Authorization: Bearer eyJhbG...
  Response: AI生成結果
```

### フロントエンド構成

- **コンポーネント分割**: 認証、画像編集、ギャラリーを個別コンポーネント化
- **多言語対応**: `ja`/`en`/`zh`の3言語をサポート
- **data-testid**: mablテスト用に全操作要素に`data-testid`属性を付与

### バックエンド構成

- **開発時**: Vite開発サーバー（5173）からAPIサーバー（3000）へプロキシ
- **本番時**: Express（3000）が静的ファイル配信とAPIを兼務
- **Docker**: `docker-compose.yml`で本番環境をコンテナ化

### 主要なdata-testid

| data-testid | 要素 | 説明 |
|-------------|------|------|
| `app-title` | h1 | アプリタイトル |
| `env-select` | select | 環境選択（staging/production） |
| `lang-select` | select | 言語選択（ja/en/zh） |
| `api-server-select` | select | APIサーバー選択 |
| `email` | input | メールアドレス入力 |
| `password` | input | パスワード入力 |
| `btn-login` | button | ログインボタン |
| `btn-logout` | button | ログアウトボタン |
| `login-state` | span | ログイン状態表示 |
| `btn-upload` | button | 画像アップロード |
| `img-preview` | img | プレビュー画像 |
| `ai-prompt` | input | AIプロンプト入力 |
| `btn-ai-generate` | button | AI背景生成 |
| `slider-temp` | input | 色温度スライダー |
| `slider-sat` | input | 彩度スライダー |
| `btn-apply` | button | 補正適用 |
| `btn-save` | button | ギャラリー保存 |
| `btn-download` | button | ダウンロード |
| `api-payload` | pre | APIペイロード表示 |
| `gallery-id-{id}` | img | ギャラリー画像 |

### ポート構成

| サービス | ポート | 用途 |
|---------|--------|------|
| Vite dev server | 5173 | フロントエンド開発 |
| Express server | 3000 | API / 本番静的配信 |
| Docker Compose | 8080 | ローカルDocker |
| Cloud Run | 443 | 本番環境 |

## 開発ノート

- フロントエンドはTailwind CSS（CDN読み込み）を使用
- AI背景生成はOpenAI DALL-E 3 APIを使用（`/api/openai`経由、JWT認証必須）
- モック関数（`mockSave`等）は実際のAPI呼び出しをシミュレート
- 画像処理はCanvas APIで実装（`bakeToCanvas`, `composeBackgroundWithImage`）

## トラブルシューティング

| 問題 | 原因 | 解決策 |
|------|------|--------|
| AI生成が動作しない | APIキー未設定 | `.env` に `OPENAI_API_KEY` を設定 |
| ポート競合 | 既存プロセス | `lsof -i :3000` で確認・終了 |
| Dockerビルド失敗 | キャッシュ問題 | `docker compose build --no-cache` |
| CORSエラー | APIプロキシ未経由 | Vite dev server経由でアクセス |
| Basic認証が効かない | 片方のみ設定 | USERNAME と PASSWORD 両方設定 |

```bash
# TypeScript エラーチェック
npx tsc --noEmit

# ポート 3000/5173 使用プロセス確認
lsof -i :3000 -i :5173

# Expressサーバーログ（開発時）
npm run dev:server 2>&1 | tee server.log

# Docker ログ
docker compose logs -f app

# Cloud Run ログ（要 gcloud CLI）
gcloud run services logs read mabl-cosme --region=asia-northeast1
```

## GitHub Actions / CI環境での設定

`.github/workflows/deploy.yml`でCloud Runへの自動デプロイを実行。

- **トリガー**: `main` ブランチへの push
- **リージョン**: `asia-northeast1`
- **リソース**: 512Mi メモリ / 1 CPU


以下のシークレットをGitHub Secretsに設定:

| シークレット | 説明 |
|-------------|------|
| `GCP_PROJECT_ID` | Google Cloud プロジェクトID |
| `WIF_PROVIDER` | Workload Identity Federation プロバイダー |
| `WIF_SERVICE_ACCOUNT` | サービスアカウント |
| `OPENAI_API_KEY` | OpenAI APIキー |
| `AUTH_USERNAME` | ログイン用ユーザー名 |
| `AUTH_PASSWORD` | ログイン用パスワード |
| `JWT_SECRET` | JWT署名用シークレット |

デプロイ時に環境変数としてCloud Runに渡される:

```yaml
--set-env-vars "OPENAI_API_KEY=${{ secrets.OPENAI_API_KEY }}"
--set-env-vars "AUTH_USERNAME=${{ secrets.AUTH_USERNAME }}"
--set-env-vars "AUTH_PASSWORD=${{ secrets.AUTH_PASSWORD }}"
--set-env-vars "JWT_SECRET=${{ secrets.JWT_SECRET }}"
```
