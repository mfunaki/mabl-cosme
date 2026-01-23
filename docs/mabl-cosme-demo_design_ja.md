# mabl-cosme-demo_design.md

## 0. メタ情報

- プロジェクト名: **mabl-cosme**
- リポジトリ: **mabl-cosme**
- 想定ドメイン: ローカル実行 (`http://localhost:5173` - Vite dev / `http://localhost:3000` - API server) または Docker (`http://localhost:3000`)
- 技術スタック（実装済み）:
  - フロントエンド: React 18.2.0 + TypeScript 5.2.2 + Vite 5.2.0
  - スタイル: Tailwind CSS 3.x（CDN読み込み）
  - ビルド: Vite ([@vitejs/plugin-react](https://www.npmjs.com/package/@vitejs/plugin-react) 4.2.1)
  - バックエンド: Node.js 20 + Express 4.18.2
  - AI統合: OpenAI DALL-E 3（APIプロキシ経由）
  - デプロイ: Docker (Node.js 18-slim) + Google Cloud Run
- 用途:
  - 生成AI系コスメ/ビジュアルSaaSを模した **E2Eテストデモ用アプリ**
  - mabl + LLM による「UIコード生成」「自動テスト生成」のサンプル題材

---

## 1. 概要

mabl-cosme-demo は、以下の一連のワークフローを再現するデモアプリである。

1. ログイン（モック）
2. 画像アップロード（製品写真などを想定）
3. 「AI背景生成」（**実際のDALL-E 3 API呼び出し**）
4. 背景画像と元画像の合成
5. 色調補正（色温度 / 彩度）
6. 画像の保存・ダウンロード
7. ギャラリー表示
8. 多言語対応（日本語 / 英語 / 中国語）
9. 環境切替（staging / production）表示
10. APIサーバー切替（同一ホスト / 別ホスト）

**目的**:
- LLM が仕様を読み取り、UIコード・状態管理・テストコード（mablテストステップ）を自動生成しやすい構成にする。
- mabl の UIテスト / APIライクな検証 / ビジュアル検証のデモ題材として利用する。

---

## 2. 想定利用シナリオ

- **セールス/ソリューションエンジニア** が、
  - 「生成AIコスメSaaSっぽい UI」を題材に
  - 「mabl + LLM でテストを自動生成できます」を示すためのデモ。

- テストで確認したい項目:
  - 典型的な SaaS ワークフロー: ログイン → アップロード → 処理 → 保存
  - AI 生成結果（DALL-E 3による実際の背景生成と合成）
  - 多言語 UI と環境切り替え
  - data-testid を使った安定したセレクタ設計

---

## 3. 画面構成

単一ページアプリ（SPA）構成。

### 3.1 ヘッダー

- 要素
  - タイトル: 「AIビジュアル制作ワークフロー(デモ)」（日本語時）
    - `data-testid="app-title"`
    - サブタイトル: "Mock UI for mabl E2E demo" (固定・英語)
  - 環境セレクトボックス
    - `staging.mabl-cosme.com` / `app.mabl-cosme.com`
    - `data-testid="env-select"`
    - `id="env-select"`
  - 言語セレクトボックス
    - `JA` / `EN` / `ZH`
    - `data-testid="lang-select"`
    - `id="lang-select"`
  - APIサーバーセレクトボックス
    - `同一ホスト` / `別ホスト`
    - `data-testid="api-server-select"`
    - `id="api-server-select"`

### 3.2 Auth セクション

- セクションタイトル: "Auth" (固定・英語)
- ログインフォーム（モック認証）
  - メールアドレス入力:
    - `data-testid="email"`
    - `ref` を使用（emailRef）
    - placeholder: "user@example.com"
  - パスワード入力:
    - `data-testid="password"`
    - `ref` を使用（passRef）
    - `type="password"`
    - placeholder: "••••••••"
  - ログインボタン:
    - `data-testid="btn-login"`
  - ログイン後状態表示:
    - `data-testid="login-state"`
    - テキスト: "Logged in" (固定・英語、緑色のテキストで表示)
  - ログアウトボタン:
    - `data-testid="btn-logout"`
    - ログイン時のみ表示

### 3.3 Upload & 編集セクション

1. **画像アップロードエリア**
   - セクションタイトル: "Upload" (固定・英語)
   - 「画像をアップロード」ボタン (labelでfile inputトリガ)
     - `data-testid="btn-upload"`
     - `id="file-input"` (hidden input)
     - `htmlFor="file-input"` (label)
   - ドラッグ＆ドロップ対応（border-2 border-dashed の領域）
   - "または ここにドロップ" / "or drop here" などの補足テキスト
   - バリデーションエラーメッセージ
     - `data-testid="upload-error"`（エラー時のみ、赤色テキストで表示）
   - 許容形式: `image/png`, `image/jpeg`
   - 最大サイズ: 10MB
   - エラーメッセージ:
     - ファイル形式エラー: "Only JPG/PNG supported"
     - サイズエラー: "Max 10MB"

2. **画像プレビュー**
   - 正方形アスペクト（aspect-square）のプレビュー領域
   - 背景色: slate-100
   - プレビュー用画像:
     - `data-testid="img-preview"`
     - `ref={imgEl}` を使用（HTMLImageElement）
     - `processedImgUrl` または `imgUrl` を表示し、色調補正は Canvas API の結果（`bakeToCanvas`）を反映
   - 元画像保持用の非表示 `<img>` 要素:
     - `ref={originalImgEl}` を使用（`className="hidden"`）
     - `onLoad` イベントで `lastApi` に `{ok: true, message: 'image-loaded'}` を設定
   - 未アップロード時: 「No image」テキスト表示（opacity-50）

3. **AI 背景生成**
   - プロンプト入力欄:
     - `data-testid="ai-prompt"`
     - `id="ai-prompt"`
     - textarea形式、2行
     - デフォルト値: 言語に応じたプロンプト（例：「ハワイの海岸の背景」）
   - ボタン: `data-testid="btn-ai-generate"`
   - エラー表示:
     - `data-testid="ai-error"`（エラー時のみ、赤色テキストで表示）
   - 動作:
     - 画像未アップロード時: ブラウザアラート表示（t.needImage）
     - 画像あり:
       - バックエンドAPI（`/api/openai`）経由でDALL-E 3を呼び出し
       - 生成された背景画像と元画像をCanvas APIで合成
       - 合成結果をプレビューに表示
   - 生成中は「生成中...」/ "Generating..." 表示 & ボタン `disabled`
   - `disabled={!imgUrl || aiBusy}` により、画像がない場合やビジー中は非活性

4. **色調補正パネル**
   - 背景色: slate-50、丸みのあるパネル（rounded-2xl）
   - ラベル: 「色調補正 / Adjust Colors」（言語切替対応）
   - スライダー1: 色温度 (-100〜100)
     - `data-testid="slider-temp"`
     - `id="temp"`
     - ラベルに現在値を表示: "{t.colorTemp}: {colorTemp}"
     - clamp関数で範囲制限
   - スライダー2: 彩度 (-100〜100)
     - `data-testid="slider-sat"`
     - `id="sat"`
     - ラベルに現在値を表示: "{t.saturation}: {saturation}"
     - clamp関数で範囲制限
   - 適用ボタン:
     - `data-testid="btn-apply"`
     - 押下で `lastApi.filterApplied = true` / `message = "applied"` に更新
   - 実際の表示: Canvas APIで実際のピクセル操作（bakeToCanvas関数）
     - 色温度: 暖色系のオーバーレイ (rgba(255,200,100))
     - 彩度: 白または黒のオーバーレイで調整
     - スライダー変更時にデバウンス処理（100ms）で反映

5. **保存・ダウンロード操作**
   - 保存ボタン: `data-testid="btn-save"`
     - 画像未アップロード時: ブラウザアラート表示（t.needImage）
     - 現在の画像（processedImgUrl または imgUrl）を保存
     - `mockSave` で疑似API呼び出し（300ms sleep）
     - 成功時、ギャラリーに1件追加（配列の先頭に挿入）
     - 戻り値の例: `{ status: 200, ok: true, id: <ランダムID> }`
   - ダウンロードボタン: `data-testid="btn-download"`
     - 画像未アップロード時: ブラウザアラート表示（t.needImage）
     - 現在の画像をPNGとしてダウンロード
     - ファイル名: `mabl-cosme-demo-<timestamp>.png`
     - `<a>` 要素を動的に作成してクリック

6. **API ペイロード表示**
   - `lastApi` ステートの JSON を表示
   - `data-testid="api-payload"`
   - `<pre>` タグで整形表示（2スペースインデント）
   - 背景色: slate-100、丸みあり（rounded-xl）
   - 最大高さ: 160px（10rem）でスクロール対応
   - mabl から JSON文字列として部分一致/キー値検証を行う用途
   - 表示される値の例:
     - 画像読み込み時: `{ok: true, message: 'image-loaded'}`
     - AI生成後: `{status: 200, ok: true, imageUrl: '...', message: 'AI background generated and composed'}`
     - 適用後: `filterApplied: true`, `message: 'applied'`
     - 保存後: `{status: 200, ok: true, id: <ランダムID>}`

### 3.4 ギャラリーセクション

- ギャラリータイトル表示: 「ギャラリー / Gallery」（言語切替対応）
- 背景色: white、丸みあり（rounded-2xl）
- 保存された画像のカード一覧（グリッドレイアウト）
  - レスポンシブ: sm:grid-cols-2 md:grid-cols-3
  - 各カード:
    - 画像プレビュー（h-48、object-cover）
    - 下部に情報表示（p-3、text-xs、opacity-70）:
      - ID表示:
        - `data-testid="gallery-id-<保存ID>"`
        - 表示形式: "ID: <保存ID>"
      - 作成日時（ローカル時刻で表示）
        - `new Date(g.createdAt).toLocaleString()` 形式
- 保存件数0件のとき: 「—」表示（text-sm、opacity-60）

### 3.5 フッター

- テキスト:
  - 「Demo only. No data leaves your browser.」等
- 実際にサーバ送信は行わないことを明示。

---

## 4. ユーザーフロー / シナリオ

### シナリオ A: 基本E2Eフロー

1. ユーザーがアプリを開く
2. 環境を確認（デフォルト: `staging`）
3. メールアドレス・パスワード入力 → ログイン
4. 画像をアップロード（またはドラッグ）
5. 背景生成プロンプトを入力（またはデフォルト使用）
6. 「背景をAIで生成」ボタン押下
   - DALL-E 3で背景生成
   - 元画像と合成
   - `api-payload` に `status: 200, ok: true` 表示
7. 色温度・彩度スライダーで調整（リアルタイム反映）
8. 「適用」ボタン押下 → `filterApplied: true` となる
9. 「保存」ボタン押下 → ギャラリーに1件追加される
10. 「ダウンロード」でPNGを保存

### シナリオ B: 多言語確認

1. シナリオAの途中or完了後
2. 言語セレクトを `EN` に変更
3. ボタン/ラベルが英語表示に変わることを確認
4. AIプロンプトのデフォルト値も言語に応じて変更される
5. `ZH` に変更し、中国語文言を確認

### シナリオ C: 入力エラー

1. 11MBの JPG をアップロード
2. `upload-error` に「Max 10MB」などのエラー表示
3. 非画像ファイル（`test.txt` 等）で `Only JPG/PNG supported` を表示

### シナリオ D: 画像なし操作

1. ログインはするが画像アップロードを行わない
2. 「背景をAIで生成」 or 「保存」 or 「ダウンロード」を押下
3. 「先に画像をアップロードしてください」アラート

### シナリオ E: APIサーバー切替

1. APIサーバーセレクトで「同一ホスト」または「別ホスト」を選択
2. 「背景をAIで生成」ボタン押下
3. 選択したサーバーにAPI呼び出しが行われることを確認

---

## 5. 機能要件

### 5.1 共通

- SPAとして1ページ完結。
- 全てのテキストは言語テーブル `T[locale]` から取得。
- data-testid は **固定文字列** とし、翻訳の影響を受けない。

### 5.2 認証（モック）

- 実際のバックエンド連携は行わない。
- メール・パスワードがともに非空の時、`btn-login` クリックで `loggedIn = true`。
  - `emailRef.current?.value` と `passRef.current?.value` をチェック
- ログイン状態:
  - `login-state` に `"Logged in"` を表示（固定・英語、text-emerald-700）
  - ログアウトボタン表示 (`btn-logout`)
  - ログイン成功後、入力フォームは非表示になる
- ログアウト時:
  - `setLoggedIn(false)` で状態をリセット
  - ログインフォームが再表示される

### 5.3 画像アップロード

- 受け取った File を `URL.createObjectURL` でプレビュー表示。
- `useEffect` で file が変更されたら URL を生成し、クリーンアップで `revokeObjectURL` を呼び出す
- バリデーション条件:
  - `type` が `image/png` または `image/jpeg` であること（正規表現: `/image\/(png|jpe?g)/`）
  - `size <= 10MB` (10 * 1024 * 1024 bytes)
- バリデーションNG時:
  - `upload-error` に英語メッセージ（固定）を表示
    - ファイル形式エラー: "Only JPG/PNG supported"
    - サイズエラー: "Max 10MB"
  - 状態として `file` は更新しない
- ドラッグ＆ドロップ対応:
  - `onDrop` イベントで `e.dataTransfer.files?.[0]` を取得
  - `onDragOver` で `e.preventDefault()` を呼び出し

### 5.4 AI背景生成（DALL-E 3 API）

- `btn-ai-generate` クリック時の条件:
  - 画像が読み込まれていない場合 (`!file || !imgEl.current`) → ブラウザアラート表示（t.needImage）
  - 読み込まれている場合:
    - `aiBusy = true`（ボタンテキストが「生成中...」に変更）
    - `generateBackgroundWithAI(aiPrompt, apiBaseUrl)` を非同期呼び出し
    - 成功時: `composeBackgroundWithImage` で背景と元画像を合成
    - 合成結果を `imgUrl` に設定
    - 失敗時: `aiError` にエラーメッセージを設定
    - 結果を `lastApi` に格納
    - `aiBusy = false` に戻す

- `generateBackgroundWithAI` 関数の実装:
  ```typescript
  async function generateBackgroundWithAI(prompt: string, apiBaseUrl: string) {
    const enhancedPrompt = `Generate a background image that is: ${prompt}. The image should be suitable as a professional background. High quality, detailed.`

    const response = await fetch(`${apiBaseUrl}/api/openai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json"
      })
    })

    // レスポンス処理...
    return { status: 200, ok: true, imageUrl: `data:image/png;base64,${data.data[0].b64_json}` }
  }
  ```

- `composeBackgroundWithImage` 関数の実装:
  ```typescript
  async function composeBackgroundWithImage(backgroundBase64: string, originalFile: File): Promise<string> {
    // Canvasを作成（1024x1024）
    // 背景を描画
    // 元画像を中央に配置してリサイズ
    // 元画像を背景の上に描画
    // 合成画像をBase64に変換して返す
  }
  ```

### 5.5 色調補正

- 色温度（colorTemp）と彩度（saturation）の値を管理
  - 初期値: 0
  - 範囲: -100 〜 100
  - `clamp` 関数で範囲外の値を制限

- 色調補正の反映:
  - スライダー変更時にデバウンス処理（100ms）を適用
  - `bakeToCanvas` 関数でCanvas APIを使用して実際にピクセル操作
  - 結果を `processedImgUrl` に設定

- `bakeToCanvas` 関数（Canvas APIでピクセル操作）:
  ```typescript
  function bakeToCanvas(img: HTMLImageElement, colorTemp: number, saturation: number): string {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const maxW = 1280, maxH = 1280
    let { width, height } = img
    const scale = Math.min(1, maxW / width, maxH / height)
    width = Math.floor(width * scale)
    height = Math.floor(height * scale)
    canvas.width = width
    canvas.height = height
    ctx.drawImage(img, 0, 0, width, height)
    const warmth = (colorTemp + 100) / 200
    if (warmth > 0) {
      ctx.fillStyle = `rgba(255,200,100,${0.08 * warmth})`
      ctx.fillRect(0,0,width,height)
    }
    if (saturation !== 0) {
      const mag = Math.abs(saturation) / 100
      ctx.fillStyle = saturation > 0
        ? `rgba(255,255,255,${0.05 * mag})`
        : `rgba(0,0,0,${0.05 * mag})`
      ctx.fillRect(0,0,width,height)
    }
    return canvas.toDataURL('image/png')
  }
  ```

- 適用ボタン (`btn-apply`) 押下時:
  - `lastApi` に `filterApplied: true`, `message: 'applied'` を設定

### 5.6 画像の保存

- 保存処理 (`saveToGallery` 関数):
  - 画像がない場合: アラート表示
  - `processedImgUrl` または `imgUrl` を使用
  - `mockSave` を呼び出し（300ms sleep）
  - 成功時:
    - `saved` 配列の先頭に追加
    - `{ id: <ランダムID>, dataUrl: <Data URL>, createdAt: <ISO文字列> }`
  - `lastApi` に保存結果を設定

- `mockSave` 関数の実装:
  ```typescript
  async function mockSave(_dataUrl: string) {
    await sleep(300)
    return {
      status: 200,
      ok: true,
      id: Math.random().toString(36).slice(2)
    } as const
  }
  ```

### 5.7 ダウンロード

- `downloadCurrent` 関数:
  - 画像がない場合: アラート表示
  - `processedImgUrl` または `imgUrl` を使用
  - `<a>` 要素を動的に生成し、`href` に Data URL を設定
  - `download` 属性にファイル名を設定: `mabl-cosme-demo-<timestamp>.png`
  - プログラム的に `click()` を実行してダウンロード開始

### 5.8 ギャラリー管理

- `saved` ステート: 保存された画像の配列
  - 型: `{ id: string; dataUrl: string; createdAt: string }[]`
  - 初期値: `[]`

- 画像追加時: 配列の先頭に追加（新しい順）
- 表示:
  - グリッドレイアウト（レスポンシブ）
  - 各カードに画像、ID、作成日時を表示
  - 0件の場合: 「—」のみ表示

### 5.9 多言語対応

- 3つのロケールをサポート: `ja`, `en`, `zh`
- 翻訳テーブル `T: Record<Locale, Record<string, string>>`
  - 各ロケールに対応する文字列を定義
  - 主要な UI ラベル、ボタンテキスト、メッセージを翻訳

- 翻訳される要素の例:
  - appTitle, env, login, logout, email, password
  - upload, orDrop, aiGenerate, adjust, colorTemp, saturation
  - apply, save, download, gallery, language
  - generating, applied, saved, needImage
  - promptLabel, defaultPrompt, apiServer, sameHost, cloudServer

- `locale` ステートで現在の言語を管理
- 言語切替時: `setLocale` で即座に UI を更新
- 言語切替時: `aiPrompt` のデフォルト値も更新
- data-testid は言語に依存しない固定文字列を使用

### 5.10 環境切替

- `env` ステート: `'staging' | 'production'`
- 初期値: `'staging'`
- セレクトボックスで切替可能:
  - `staging.mabl-cosme.com`
  - `app.mabl-cosme.com`
- 実際の API 呼び出しやルーティングは行わない（UI 表示のみ）

### 5.11 APIサーバー切替

- `apiServerId` ステート: `'same' | 'cloud'`
- 初期値: `'same'`
- セレクトボックスで切替可能:
  - `同一ホスト` / `Same Host`: API呼び出し先が同一ホスト
  - `別ホスト` / `Different Host`: Cloud Run上の別ホスト（`https://mabl-cosme-api-ixi7x7b23a-an.a.run.app`）
- AI背景生成時に選択したサーバーにリクエストを送信

---

## 6. 実装の詳細

### 6.1 ファイル構成

```
/
├── Dockerfile              # Node.js ビルド + Node.js 本番サーバー
├── docker-compose.yml      # ローカル Docker 設定
├── index.html              # Vite エントリーポイント、Tailwind CDN 読み込み
├── package.json            # 依存関係とスクリプト
├── tsconfig.json           # TypeScript コンパイラ設定
├── vite.config.ts          # Vite 設定（React プラグイン + API プロキシ）
├── .env.example            # 環境変数テンプレート
├── .github/
│   └── workflows/
│       └── deploy.yml      # Cloud Run デプロイ設定
├── docs/
│   └── mabl-cosme-demo_design_ja.md  # 設計ドキュメント（本ファイル）
├── server/
│   ├── index.js            # Express サーバー
│   └── proxy.js            # OpenAI API プロキシ
└── src/
    ├── App.tsx             # メインアプリケーションコンポーネント
    ├── main.tsx            # React エントリーポイント
    ├── contexts/           # React Context（多言語用、未使用）
    └── i18n/               # 翻訳ファイル（テンプレート）
```

### 6.2 主要な依存関係

- React: 18.2.0
- React DOM: 18.2.0
- TypeScript: 5.2.2
- Vite: 5.2.0
- @vitejs/plugin-react: 4.2.1
- Express: 4.18.2
- OpenAI SDK: 4.77.3
- Tailwind CSS: 3.x（CDN）
- concurrently: 8.2.2（開発時）

### 6.3 開発・ビルドコマンド

```bash
# 開発サーバー起動（フロント＋バック同時）
npm run dev:all

# フロントエンド開発サーバー起動（http://localhost:5173）
npm run dev

# バックエンドAPIサーバー起動（http://localhost:3000）
npm run dev:server

# プロダクションビルド
npm run build

# ビルド結果のプレビュー実行
npm run preview

# ESLint実行
npm run lint
```

### 6.4 Docker デプロイ

```bash
# Docker Compose でローカル実行（ポート 3000）
docker compose up --build

# イメージビルド
docker build -t mabl-cosme .

# コンテナ実行（ポート 3000）
docker run -p 3000:3000 -e OPENAI_API_KEY=$OPENAI_API_KEY mabl-cosme
```

- ビルドステージ: Node.js 20-alpine で npm ビルド
- 実行ステージ: Node.js 18-slim でExpressサーバー実行
- ビルド成果物: `/app/dist` + `/app/server`
- ポート: 3000

### 6.5 バックエンドサーバー

- **Express アプリケーション**
  - JSONボディパーサー: 最大10MB対応
  - Basic認証ミドルウェア（環境変数で有効化。`dist` 配下の静的ファイル配信と SPA ルートに適用されるが、`/api/*` には適用しない）
  - APIプロキシ: `/api/openai` → OpenAI API
  - 本番モード: 静的ファイル配信 + SPA フォールバック
  - 開発モード: API のみ提供

- **環境変数**
  ```bash
  OPENAI_API_KEY=sk-xxx          # OpenAI APIキー（必須）
  BASIC_AUTH_USERNAME=admin      # Basic認証ユーザー名（オプション）
  BASIC_AUTH_PASSWORD=password   # Basic認証パスワード（オプション）
  ```

### 6.6 重要な React フック使用例

- `useState`: 各種ステート管理（locale, env, apiServerId, loggedIn, file, uploadError, imgUrl, processedImgUrl, aiBusy, aiError, lastApi, colorTemp, saturation, saved, aiPrompt）
- `useRef`: DOM 参照（emailRef, passRef, imgEl, originalImgEl）
- `useEffect`:
  - file 変更時の URL 生成とクリーンアップ
  - locale 変更時の aiPrompt 更新
  - colorTemp/saturation 変更時の processedImgUrl 更新（デバウンス処理）

### 6.7 ヘルパー関数

- `sleep(ms)`: Promise ベースの遅延処理
- `clamp(n, min, max)`: 数値の範囲制限
- `bakeToCanvas(img, colorTemp, saturation)`: Canvas への焼き込み
- `generateBackgroundWithAI(prompt, apiBaseUrl)`: DALL-E 3 API呼び出し
- `composeBackgroundWithImage(backgroundBase64, originalFile)`: 背景と元画像の合成

---

## 7. テスト観点

### 7.1 mabl での検証項目

- **認証フロー**:
  - ログイン成功（メール・パスワード入力 → `login-state` 表示）
  - ログアウト（`btn-logout` → フォーム再表示）

- **画像アップロード**:
  - 正常系: PNG/JPEG ファイル（10MB以下）
  - 異常系:
    - 非画像ファイル → `upload-error` に "Only JPG/PNG supported"
    - 大容量ファイル → `upload-error` に "Max 10MB"

- **AI 生成**:
  - 画像なし → アラート表示
  - 画像あり → `lastApi` に `status: 200`, `ok: true` など
  - ビジー状態 → ボタンテキスト変化、disabled 状態
  - エラー時 → `ai-error` にエラーメッセージ表示
  - 背景画像と元画像の合成確認

- **色調補正**:
  - スライダー操作 → プレビュー画像の変化（Canvas API）
  - 適用ボタン → `lastApi.filterApplied: true`

- **保存・ダウンロード**:
  - 保存 → ギャラリーに新規カード追加、ID 表示
  - ダウンロード → PNG ファイルダウンロード

- **多言語切替**:
  - `lang-select` 変更 → UI ラベルが対応言語に変化
  - AIプロンプトのデフォルト値も変化
  - data-testid は変化しない

- **環境切替**:
  - `env-select` 変更 → 選択値が保持される

- **APIサーバー切替**:
  - `api-server-select` 変更 → AI生成時のAPI呼び出し先が変更される

### 7.2 API ペイロード検証

- `api-payload` 要素の JSON 文字列を検証:
  - キーの存在: `ok`, `status`, `message`, etc.
  - 値の確認: `status: 200`, `ok: true`, `filterApplied: true`

### 7.3 ビジュアル検証

- ヘッダーレイアウト
- 画像プレビューの表示
- ギャラリーカードのグリッドレイアウト
- 色調補正後の画像の視覚的変化
- AI生成後の合成画像

---

## 8. まとめ

本アプリケーションは、生成AI系SaaSを模した E2E テストデモ用 SPA です。主な特徴:

- **実際のAI連携**: DALL-E 3 APIによる背景生成と画像合成
- **バックエンドAPI**: Express + OpenAI APIプロキシによるAPIキー管理
- **テスタブル設計**: data-testid による安定したセレクタ
- **多言語・環境切替**: 実際の国際化対応や環境分離をシミュレート
- **Canvas API**: 色調補正・画像合成に実際のピクセル操作
- **クラウドデプロイ対応**: Docker + Google Cloud Run

mabl と LLM を組み合わせたテスト生成のデモとして、典型的な SaaS ワークフローを網羅しています。
