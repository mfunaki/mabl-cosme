# WARP.md - mabl-cosme 開発効率化ガイド

> このドキュメントは、Warp ターミナルおよび AI アシスタントとの連携を最大化するためのリファレンスです。

---

## 1. Project Overview

### 概要
**mabl-cosme** は、生成AI（DALL-E 3）を活用したビジュアル制作ワークフローのデモアプリケーションです。mabl の E2E 自動テストツールとの連携を前提に構築されており、AI によるテスト自動生成のデモンストレーションに使用されます。

### 主要技術スタック

| レイヤー | 技術 | バージョン |
|---------|------|-----------|
| **フロントエンド** | React + TypeScript | 18.2 / 5.2 |
| **ビルドツール** | Vite | 5.2 |
| **スタイリング** | Tailwind CSS | CDN |
| **バックエンド** | Node.js + Express | 20 / 4.18 |
| **AI 統合** | OpenAI DALL-E 3 | 4.77 |
| **画像処理** | Canvas API | Native |
| **コンテナ** | Docker | Multi-stage |
| **デプロイ** | Google Cloud Run | - |
| **CI/CD** | GitHub Actions | - |

### 主要機能
- 🖼️ 画像アップロード（JPG/PNG、最大10MB）
- 🎨 AI 背景生成（DALL-E 3）
- 🔧 色調補正（色温度・彩度）
- 🌐 多言語対応（日本語/英語/中国語）
- 🔐 Basic 認証（オプション）
- 🧪 mabl テスト用 data-testid 完備

---

## 2. Quick Start

### 環境構築

```bash
# 1. リポジトリクローン
git clone https://github.com/mfunaki/mabl-cosme.git
cd mabl-cosme

# 2. 依存関係インストール
npm install

# 3. 環境変数設定
cp .env.example .env
# .env を編集し OPENAI_API_KEY を設定
```

### 開発コマンド

| コマンド | 説明 |
|---------|------|
| `npm run dev:all` | フロント＋バック同時起動（推奨） |
| `npm run dev` | フロントエンド開発サーバー（:5173） |
| `npm run dev:server` | API サーバー（:3000） |
| `npm run build` | 本番用ビルド |
| `npm start` | 本番モード起動 |
| `npm run lint` | ESLint 実行 |

### Docker での起動

```bash
# Docker Compose でローカル実行
docker compose up --build

# アクセス: http://localhost:8080
```

---

## 3. Key Directories

```
mabl-cosme/
├── src/                          # フロントエンドソース
│   ├── App.tsx                   # メインコンポーネント（全UI）
│   ├── main.tsx                  # React エントリーポイント
│   ├── contexts/                 # React Context（多言語）
│   └── i18n/                     # 翻訳ファイル
│
├── server/                       # バックエンドソース
│   ├── index.js                  # Express サーバー
│   └── proxy.js                  # OpenAI API プロキシ
│
├── dist/                         # ビルド出力（本番用）
│
├── .github/workflows/            # CI/CD 設定
│   └── deploy.yml                # Cloud Run デプロイ
│
├── docs/                         # ドキュメント
│
├── Dockerfile                    # コンテナビルド設定
├── docker-compose.yml            # ローカル Docker 設定
├── vite.config.ts                # Vite 設定
├── tsconfig.json                 # TypeScript 設定
├── .env.example                  # 環境変数テンプレート
└── package.json                  # npm 設定・スクリプト
```

### 重要ファイル早見表

| ファイル | 役割 |
|---------|------|
| `src/App.tsx` | UI ロジック全体（単一コンポーネント設計） |
| `server/index.js` | Express サーバー、認証、静的ファイル配信 |
| `server/proxy.js` | OpenAI API プロキシ（APIキー隠蔽） |
| `.env` | 環境変数（API キー、認証情報） |
| `Dockerfile` | マルチステージビルド設定 |

---

## 4. Environment & Tools

### 必須環境変数

```bash
# .env ファイル
OPENAI_API_KEY=sk-your-api-key-here    # 必須: DALL-E 3 API キー

# オプション: Basic 認証（両方設定で有効化）
BASIC_AUTH_USERNAME=admin
BASIC_AUTH_PASSWORD=your-secure-password
```

### Docker 操作

```bash
# ビルド
docker build -t mabl-cosme .

# 実行
docker run -p 8080:3000 -e OPENAI_API_KEY=$OPENAI_API_KEY mabl-cosme

# Docker Compose
docker compose up --build        # ビルド＆起動
docker compose up -d             # バックグラウンド起動
docker compose down              # 停止
docker compose logs -f           # ログ確認
```

### ポート構成

| サービス | ポート | 用途 |
|---------|--------|------|
| Vite dev server | 5173 | フロントエンド開発 |
| Express server | 3000 | API / 本番静的配信 |
| Docker Compose | 8080 | ローカル Docker |
| Cloud Run | 443 | 本番環境 |

### Cloud Run デプロイ

GitHub Actions による自動デプロイ:
- **トリガー**: `main` ブランチへの push
- **リージョン**: `asia-northeast1`
- **リソース**: 512Mi メモリ / 1 CPU

---

## 5. Warp Workflows

以下は Warp の「Workflow」として登録推奨のコマンドです。

### 基本操作

```yaml
# workflow: mabl-cosme-dev
name: "開発サーバー起動"
command: "npm run dev:all"
description: "フロント＋バックエンド同時起動"

# workflow: mabl-cosme-build
name: "本番ビルド"
command: "npm run build && npm start"
description: "ビルドして本番モードで起動"

# workflow: mabl-cosme-docker
name: "Docker 起動"
command: "docker compose up --build"
description: "Docker Compose でローカル実行"
```

### Git 操作

```yaml
# workflow: mabl-cosme-status
name: "Git ステータス確認"
command: "git status && git log --oneline -5"
description: "変更状況と最近のコミット確認"

# workflow: mabl-cosme-deploy
name: "本番デプロイ"
command: "git push origin main"
description: "main ブランチに push して Cloud Run デプロイ"
```

### トラブルシューティング

```yaml
# workflow: mabl-cosme-logs
name: "Docker ログ確認"
command: "docker compose logs -f --tail=50"
description: "Docker コンテナのログをリアルタイム表示"

# workflow: mabl-cosme-clean
name: "クリーンビルド"
command: "rm -rf node_modules dist && npm install && npm run build"
description: "依存関係とビルドをクリーンリセット"

# workflow: mabl-cosme-env-check
name: "環境変数確認"
command: "cat .env | grep -v '^#' | grep -v '^$'"
description: "設定済み環境変数の確認（値は表示）"
```

### 便利なワンライナー

```bash
# TypeScript エラーチェック
npx tsc --noEmit

# 未使用の依存関係を検出
npx depcheck

# ポート 3000/5173 使用プロセス確認
lsof -i :3000 -i :5173

# OpenAI API キー有効性確認（モデル一覧取得）
curl https://api.openai.com/v1/models -H "Authorization: Bearer $OPENAI_API_KEY" | head -20
```

---

## 6. MCP Integration

このプロジェクトで活用すべき MCP サーバーのリストです。

### 推奨 MCP サーバー

| MCP サーバー | 用途 | 活用シーン |
|-------------|------|-----------|
| **GitHub** | リポジトリ操作 | PR 作成、Issue 管理、Actions 確認 |
| **Docker** | コンテナ管理 | ビルド、実行、ログ確認 |
| **mabl** | E2E テスト | テスト作成・実行・結果確認 |
| **Filesystem** | ファイル操作 | コード編集、設定ファイル管理 |

### mabl MCP 活用例

```bash
# mabl テストの作成
mcp__mabl__create_mabl_test

# テスト実行（ローカル）
mcp__mabl__run_mabl_test_local

# テスト実行（クラウド）
mcp__mabl__run_mabl_test_cloud

# テスト結果確認
mcp__mabl__get_latest_test_runs

# 失敗分析
mcp__mabl__analyze_failure
```

### 本プロジェクト固有の data-testid 一覧

mabl テスト作成時に使用可能な要素:

| data-testid | 要素 | 説明 |
|-------------|------|------|
| `app-title` | h1 | アプリタイトル |
| `env-select` | select | 環境選択（staging/production） |
| `lang-select` | select | 言語選択（ja/en/zh） |
| `api-server-select` | select | API サーバー選択 |
| `email` | input | メールアドレス入力 |
| `password` | input | パスワード入力 |
| `btn-login` | button | ログインボタン |
| `btn-logout` | button | ログアウトボタン |
| `login-state` | span | ログイン状態表示 |
| `btn-upload` | button | 画像アップロード |
| `img-preview` | img | プレビュー画像 |
| `ai-prompt` | input | AI プロンプト入力 |
| `btn-ai-generate` | button | AI 背景生成 |
| `slider-temp` | input | 色温度スライダー |
| `slider-sat` | input | 彩度スライダー |
| `btn-apply` | button | 補正適用 |
| `btn-save` | button | ギャラリー保存 |
| `btn-download` | button | ダウンロード |
| `api-payload` | pre | API ペイロード表示 |
| `gallery-id-{id}` | img | ギャラリー画像 |

---

## 7. Troubleshooting

### よくある問題と解決策

| 問題 | 原因 | 解決策 |
|------|------|--------|
| AI 生成が動作しない | API キー未設定 | `.env` に `OPENAI_API_KEY` を設定 |
| ポート競合 | 既存プロセス | `lsof -i :3000` で確認・終了 |
| Docker ビルド失敗 | キャッシュ問題 | `docker compose build --no-cache` |
| CORS エラー | API プロキシ未経由 | Vite dev server 経由でアクセス |
| Basic 認証が効かない | 片方のみ設定 | USERNAME と PASSWORD 両方設定 |

### ログ確認コマンド

```bash
# Express サーバーログ（開発時）
npm run dev:server 2>&1 | tee server.log

# Docker ログ
docker compose logs -f app

# Cloud Run ログ（要 gcloud CLI）
gcloud run services logs read mabl-cosme --region=asia-northeast1
```

---

## 8. References

- [README.md](README.md) - プロジェクト詳細ドキュメント
- [CLAUDE.md](CLAUDE.md) - AI アシスタント向けガイド
- [docs/mabl-cosme-demo_design_ja.md](docs/mabl-cosme-demo_design_ja.md) - 設計ドキュメント
- [mabl Documentation](https://help.mabl.com/) - mabl 公式ドキュメント
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference) - DALL-E 3 API

---

*Generated for Warp Terminal - Last updated: 2025-01*
