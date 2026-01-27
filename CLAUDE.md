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

- 認証: `username`, `password`, `btn-login`, `api-server-select`
- 画像操作: `btn-upload`, `img-preview`, `btn-ai-generate`, `ai-prompt`
- 色調補正: `slider-temp`, `slider-sat`, `btn-apply`
- 保存: `btn-save`, `btn-download`, `api-payload`
- ギャラリー: `gallery-id-{id}`

## 開発ノート

- フロントエンドはTailwind CSS（CDN読み込み）を使用
- AI背景生成はOpenAI DALL-E 3 APIを使用（`/api/openai`経由、JWT認証必須）
- モック関数（`mockSave`等）は実際のAPI呼び出しをシミュレート
- 画像処理はCanvas APIで実装（`bakeToCanvas`, `composeBackgroundWithImage`）

## GitHub Actions / CI環境での設定

以下のシークレットを設定:

```yaml
env:
  OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
  AUTH_USERNAME: ${{ secrets.AUTH_USERNAME }}
  AUTH_PASSWORD: ${{ secrets.AUTH_PASSWORD }}
  JWT_SECRET: ${{ secrets.JWT_SECRET }}
```
