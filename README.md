# mabl-cosme

## セキュリティ: OpenAI API キー管理

### 重要: サーバー側でのキー管理

このアプリケーションでは、OpenAI APIキーをサーバー側で管理します。**フロントエンドに直接キーを含めないでください**。

#### 理由
- フロントエンドの環境変数（`VITE_*`）はビルド時にバンドルされ、ブラウザから閲覧可能
- APIキーが公開されると、不正使用や予期しない課金が発生するリスクあり
- サーバープロキシ経由でアクセス制御とレート制限を実装可能

### 環境変数の設定

1. `.env` ファイルを作成:
```bash
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

2. Docker Composeでの実行:
```bash
docker-compose up --build
```

### APIプロキシの実装

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
  body: JSON.stringify({ /* リクエストボディ */ })
});
```

### Azure デプロイ時の注意

Azure App Service等にデプロイする場合:
1. アプリケーション設定で `OPENAI_API_KEY` を環境変数として設定
2. キーをソースコードやリポジトリにコミットしない
3. Azure Key Vaultの使用を推奨