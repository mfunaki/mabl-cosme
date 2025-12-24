# mabl-cosme

AIビジュアル制作ワークフローのデモアプリケーション

## セットアップ

1. 依存関係のインストール:
```bash
npm install
```

2. 環境変数の設定:
```bash
cp .env.example .env
# .envファイルを編集してOPENAI_API_KEYを設定
```

3. 開発モード（2つのターミナルで実行）:
```bash
# ターミナル1: フロントエンド
npm run dev

# ターミナル2: バックエンド
npm start
```

4. 本番ビルド:
```bash
npm run build
npm start
```

## セキュリティ: OpenAI API キー管理

### 重要: サーバー側でのキー管理

このアプリケーションでは、OpenAI APIキーをサーバー側で管理します。**フロントエンドに直接キーを含めないでください**。

#### 理由
- フロントエンドの環境変数（`VITE_*`）はビルド時にバンドルされ、ブラウザから閲覧可能
- APIキーが公開されると、不正使用や予期しない課金が発生するリスクあり
- サーバープロキシ経由でアクセス制御とレート制限を実装可能

### 環境変数の設定

`.env` ファイルを作成:

```bash
# OpenAI API Key (バックエンド用 - コミットしないこと)
# https://platform.openai.com/api-keys から取得
OPENAI_API_KEY=sk-your-actual-openai-api-key-here

# オプション: 開発時のモックモード
VITE_USE_MOCK_AI=false
```

## Docker での実行

```bash
# ビルド
docker-compose build

# 起動
docker-compose up
```

アプリケーションは `http://localhost:8080` でアクセス可能です。

## APIプロキシの実装

サーバー側で `/api/openai` エンドポイントを実装:

```javascript
// server/proxy.js
router.post('/openai', async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY; // サーバー環境変数から取得
  // OpenAI APIへプロキシ
});
```

フロントエンドからの呼び出し:

```javascript
// フロントエンド
const response = await fetch('/api/openai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    model: "dall-e-3",
    prompt: "your prompt",
    size: "1024x1024"
  })
});
```

## Azure デプロイ時の注意

Azure App Service等にデプロイする場合:
1. アプリケーション設定で `OPENAI_API_KEY` を環境変数として設定
2. キーをソースコードやリポジトリにコミットしない
3. Azure Key Vaultの使用を推奨

## 技術スタック

- **フロントエンド**: React + TypeScript + Vite
- **バックエンド**: Node.js + Express
- **AI**: OpenAI DALL-E 3
- **コンテナ**: Docker + Docker Compose

## ライセンス

MIT