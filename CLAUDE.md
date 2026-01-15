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
```

## 環境変数

`.env`ファイルを作成し、以下を設定（`.env.example`を参照）:
- `OPENAI_API_KEY`: OpenAI APIキー（背景生成機能に必要）
- `BASIC_AUTH_USERNAME`/`BASIC_AUTH_PASSWORD`: Basic認証（オプション）

## アーキテクチャ

```
├── src/
│   ├── App.tsx              # メインReactコンポーネント（全UI・状態管理）
│   ├── main.tsx             # Reactエントリーポイント
│   └── contexts/            # React Context
├── server/
│   ├── index.js             # Expressサーバー（静的ファイル配信 + APIプロキシ）
│   └── proxy.js             # OpenAI APIへのプロキシルート (/api/openai)
```

### フロントエンド構成

- **単一コンポーネント設計**: `App.tsx`にすべてのUI・状態管理・ロジックが集約
- **多言語対応**: `T`オブジェクトで`ja`/`en`/`zh`の3言語をサポート
- **data-testid**: mablテスト用に全操作要素に`data-testid`属性を付与

### バックエンド構成

- **開発時**: Vite開発サーバー（5173）からAPIサーバー（3000）へプロキシ
- **本番時**: Express（3000）が静的ファイル配信とAPIプロキシを兼務

### 主要なdata-testid

- 認証: `email`, `password`, `btn-login`, `btn-logout`, `login-state`
- 画像操作: `btn-upload`, `img-preview`, `btn-ai-generate`, `ai-prompt`
- 色調補正: `slider-temp`, `slider-sat`, `btn-apply`
- 保存: `btn-save`, `btn-download`, `api-payload`
- ギャラリー: `gallery-id-{id}`

## 開発ノート

- フロントエンドはTailwind CSS（CDN読み込み）を使用
- AI背景生成はOpenAI DALL-E 3 APIを使用（`/api/openai`経由）
- モック関数（`mockSave`等）は実際のAPI呼び出しをシミュレート
- 画像処理はCanvas APIで実装（`bakeToCanvas`, `composeBackgroundWithImage`）
