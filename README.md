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

## Google Cloud Run へのデプロイ

### 自動デプロイ (GitHub Actions)

このリポジトリは、`main` ブランチへのプッシュ時に自動的にGoogle Cloud Runにデプロイされます。

#### 初回セットアップ

1. **Google Cloudプロジェクトの準備**
   ```bash
   # プロジェクトIDを設定
   export PROJECT_ID="your-gcp-project-id"

   # 必要なAPIを有効化
   gcloud services enable run.googleapis.com \
     artifactregistry.googleapis.com \
     cloudbuild.googleapis.com \
     --project=$PROJECT_ID

   # Artifact Registryリポジトリを作成
   gcloud artifacts repositories create mabl-cosme-repo \
     --repository-format=docker \
     --location=asia-northeast1 \
     --project=$PROJECT_ID
   ```

2. **Workload Identity連携の設定**
   ```bash
   # サービスアカウントを作成
   gcloud iam service-accounts create github-actions \
     --display-name="GitHub Actions" \
     --project=$PROJECT_ID

   # 必要な権限を付与
   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/run.admin"

   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/artifactregistry.writer"

   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/iam.serviceAccountUser"

   # サービスアカウントトークン作成者の権限を付与(Workload Identity用)
   gcloud iam service-accounts add-iam-policy-binding \
     "github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
     --project="$PROJECT_ID" \
     --role="roles/iam.serviceAccountTokenCreator" \
     --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com"

   # Workload Identity Poolを作成
   gcloud iam workload-identity-pools create "github" \
     --project="$PROJECT_ID" \
     --location="global" \
     --display-name="GitHub Actions Pool"

   # Workload Identity Providerを作成
   gcloud iam workload-identity-pools providers create-oidc "github-provider" \
     --project="$PROJECT_ID" \
     --location="global" \
     --workload-identity-pool="github" \
     --display-name="GitHub Provider" \
     --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
     --issuer-uri="https://token.actions.githubusercontent.com"

   # GitHubリポジトリとサービスアカウントを紐付け
   export REPO="your-github-username/mabl-cosme"
   gcloud iam service-accounts add-iam-policy-binding \
     "github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
     --project="$PROJECT_ID" \
     --role="roles/iam.workloadIdentityUser" \
     --member="principalSet://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github/attribute.repository/$REPO"
   ```

3. **GitHubシークレットの設定**

   GitHubリポジトリの Settings > Secrets and variables > Actions で以下を設定:

   - `GCP_PROJECT_ID`: GCPプロジェクトID
   - `WIF_PROVIDER`: `projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github/providers/github-provider`
   - `WIF_SERVICE_ACCOUNT`: `github-actions@PROJECT_ID.iam.gserviceaccount.com`
   - `OPENAI_API_KEY`: OpenAI APIキー

4. **デプロイ**

   `main` ブランチにプッシュすると自動的にデプロイされます:
   ```bash
   git push origin main
   ```

   手動デプロイの場合:
   - GitHub リポジトリの Actions タブから "Deploy to Cloud Run" ワークフローを選択
   - "Run workflow" をクリック

#### デプロイ後の確認

デプロイが完了すると、Cloud Runのサービス URLがワークフローログに出力されます。

### ローカル環境でのDockerテスト

デプロイ前にローカルでDockerイメージをテストできます:

```bash
# イメージをビルド
docker build -t mabl-cosme .

# コンテナを起動
docker run -p 3000:3000 -e OPENAI_API_KEY=your-key-here mabl-cosme

# ブラウザで http://localhost:3000 にアクセス
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