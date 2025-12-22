# mabl-cosme-demo_design.md

## 0. メタ情報

- プロジェクト名: **mabl-cosme-demo**
- 想定ドメイン: ローカル実行 (`http://localhost:8080`) または社内PoC環境
- 技術スタック（想定）:
  - フロントエンド: React + TypeScript + Vite
  - スタイル: Tailwind CSS（CDN読み込み）
  - デプロイ: 静的ホスティング（NGINX, Docker）
- 用途:
  - 生成AI系コスメ/ビジュアルSaaSを模した **E2Eテストデモ用アプリ**
  - mabl + LLM による「UIコード生成」「自動テスト生成」のサンプル題材

---

## 1. 概要

mabl-cosme-demo は、以下の一連のワークフローを **フロントエンドのみで疑似再現** するデモアプリである。

1. ログイン（モック）
2. 画像アップロード（製品写真などを想定）
3. 「AI背景生成」（モックAPI呼び出し）
4. 色調補正（色温度 / 彩度）
5. 画像の保存・ダウンロード
6. ギャラリー表示
7. 多言語対応（日本語 / 英語 / 中国語）
8. 環境切替（staging / production）表示

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
  - AI 生成結果自体ではなく、「処理が成功したことを示す UI / JSON 状態」を検証
  - 多言語 UI と環境切り替え
  - data-testid を使った安定したセレクタ設計

---

## 3. 画面構成

単一ページアプリ（SPA）構成。

### 3.1 ヘッダー

- 要素
  - タイトル: 「AIビジュアル制作ワークフロー（デモ）」等
    - `data-testid="app-title"`
  - 環境セレクトボックス
    - `staging.thesea.ai` / `app.thesea.ai`
    - `data-testid="env-select"`
  - 言語セレクトボックス
    - `JA` / `EN` / `ZH`
    - `data-testid="lang-select"`

### 3.2 Auth セクション

- ログインフォーム（モック認証）
  - メールアドレス入力: `data-testid="email"`
  - パスワード入力: `data-testid="password"`
  - ログインボタン: `data-testid="btn-login"`
  - ログイン後状態表示: `data-testid="login-state"`
  - ログアウトボタン: `data-testid="btn-logout"`

### 3.3 Upload & 編集セクション

1. **画像アップロードエリア**
   - 「画像をアップロード」ボタン (file inputトリガ)
     - `data-testid="btn-upload"`
   - ドラッグ＆ドロップ対応
   - バリデーションエラーメッセージ
     - `data-testid="upload-error"`（エラー時のみ）
   - 許容形式: `image/png`, `image/jpeg`
   - 最大サイズ: 10MB

2. **画像プレビュー**
   - 正方形アスペクトのプレビュー領域
   - アップロード済み画像:
     - `data-testid="img-preview"`
   - 未アップロード時: 「No image」テキスト表示

3. **AI 背景生成ボタン**
   - ボタン: `data-testid="btn-ai-generate"`
   - 動作:
     - 画像未アップロード時: アラート表示
     - 画像あり: 疑似API `mockAiGenerate` を呼び出し、結果を `lastApi` ステートに格納
     - 実際の画像ピクセルは変更しない（**UIのためのモック処理**）
   - 生成中は「生成中...」表示 & ボタン disabled

4. **色調補正パネル**
   - ラベル: 「色調補正 / Adjust Colors」
   - スライダー1: 色温度 (-100〜100)
     - `data-testid="slider-temp"`
   - スライダー2: 彩度 (-100〜100)
     - `data-testid="slider-sat"`
   - 適用ボタン:
     - `data-testid="btn-apply"`
     - 押下で `lastApi.filterApplied = true` / `message = "applied"` に更新
   - 実際の表示: CSS filter（`sepia`, `brightness`, `saturate`）で視覚的変化を表現

5. **保存・ダウンロード操作**
   - 保存ボタン: `data-testid="btn-save"`
     - 現在の画像＋フィルタを `<canvas>` に焼き込み
     - `mockSave` で疑似API呼び出し
     - 成功時、ギャラリーに1件追加
   - ダウンロードボタン: `data-testid="btn-download"`
     - `<canvas>` で生成した PNG をクライアント側でダウンロード

6. **API ペイロード表示**
   - `lastApi` ステートの JSON を表示
   - `data-testid="api-payload"`
   - mabl から JSON文字列として部分一致/キー値検証を行う用途

### 3.4 ギャラリーセクション

- ギャラリータイトル表示: 「ギャラリー / Gallery」
- 保存された画像のカード一覧
  - 各カード:
    - 画像プレビュー
    - ID表示:
      - `data-testid="gallery-id-<保存ID>"`
    - 作成日時（ローカル時刻で表示）
- 保存件数0件のとき: 「—」表示

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
5. 「背景をAIで生成」ボタン押下
   - 疑似API成功
   - `api-payload` に `status: 200, ok: true` 表示
6. 色温度・彩度スライダーで調整
7. 「適用」ボタン押下 → `filterApplied: true` となる
8. 「保存」ボタン押下 → ギャラリーに1件追加される
9. 「ダウンロード」でPNGを保存

### シナリオ B: 多言語確認

1. シナリオAの途中or完了後
2. 言語セレクトを `EN` に変更
3. ボタン/ラベルが英語表示に変わることを確認
4. `ZH` に変更し、中国語文言を確認

### シナリオ C: 入力エラー

1. 11MBの JPG をアップロード
2. `upload-error` に「Max 10MB」などのエラー表示
3. 非画像ファイル（`test.txt` 等）で `Only JPG/PNG supported` を表示

### シナリオ D: 画像なし操作

1. ログインはするが画像アップロードを行わない
2. 「背景をAIで生成」 or 「保存」 or 「ダウンロード」を押下
3. 「先に画像をアップロードしてください」アラート

---

## 5. 機能要件

### 5.1 共通

- SPAとして1ページ完結。
- 全てのテキストは言語テーブル `T[locale]` から取得。
- data-testid は **固定文字列** とし、翻訳の影響を受けない。

### 5.2 認証（モック）

- 実際のバックエンド連携は行わない。
- メール・パスワードがともに非空の時、`btn-login` クリックで `loggedIn = true`。
- ログイン状態:
  - `login-state` に `"Logged in"` などを表示（言語は英語のままでも可）。
  - ログアウトボタン表示 (`btn-logout`)

### 5.3 画像アップロード

- 受け取った File を `URL.createObjectURL` でプレビュー表示。
- バリデーション条件:
  - `type` が `image/png` または `image/jpeg` であること
  - `size <= 10MB`
- バリデーションNG時:
  - `upload-error` に英語メッセージ（固定）を表示
  - 状態として `file` は更新しない

### 5.4 AI背景生成（モックAPI）

- `btn-ai-generate` クリック時の条件:
  - 画像が読み込まれていない場合 → アラート表示
  - 読み込まれている場合:
    - `aiBusy = true`
    - `mockAiGenerate(imageElement)` を非同期呼び出し
    - 戻り値を `lastApi` に格納
    - UI上は特に画像変化不要
    - `aiBusy = false` に戻す

- `mockAiGenerate` 戻り値例:
  ```json
  {
    "status": 200,
    "ok": true,
    "filterApplied": false,
    "width": <画像の幅>,
    "height": <画像の高さ>,
    "message": "ok"
  }
