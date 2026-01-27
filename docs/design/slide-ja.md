---
marp: true
theme: default
paginate: true
header: "mabl-cosme: E2Eテストデモアプリケーション"
footer: "Copyright © 2026 mabl Inc."
style: |
  /* --- 共通の基本設定 --- */
  section {
    font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', sans-serif;
  }

  /* --- 表紙ページ専用 (title-layout) --- */
  section.title-layout {
    justify-content: center;
    text-align: center;
    background-image: url('../assets/common/bg_title.jpg');
    background-size: cover;
  }

  section.title-layout h1 {
    font-size: 65px;
    color: #312051;
    margin-bottom: 30px;
    border: none;
  }

  section.title-layout h3 {
    color: #6a1b9a;
    font-weight: normal;
    margin-top: 0;
  }

  /* --- 本文ページ専用 (body-layout) --- */
  section.body-layout {
    padding-top: 150px;
    padding-left: 80px;
    padding-right: 80px;
    padding-bottom: 80px;
    justify-content: flex-start;
    background-image: url('../assets/common/bg_body.jpg');
    background-size: cover;
    font-size: 28px;
    line-height: 1.6;
    color: #34495e;
  }

  section.body-layout h1 {
    position: absolute;
    left: 55px;
    top: 80px;
    font-size: 42px;
    color: #312051;
    margin: 0;
    border: none;
  }

  section.body-layout strong {
    color: #6a1b9a;
  }

  section.body-layout pre {
    background: #f8f9fa;
    border: 1px solid #e1e4e8;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  section.body-layout code {
    font-family: 'Fira Code', 'Cascadia Code', monospace;
    font-size: 0.85em;
    color: #d63384;
  }

  /* --- 最終ページ専用 (blank-layout) --- */
  section.blank-layout {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    background-image: url('../assets/common/bg_blank.jpg');
    background-size: cover;
    padding-bottom: 100px;
  }

  section.blank-layout h1 {
    font-size: 65px;
    color: #312051;
    margin: 0;
    border: none;
    position: static;
  }

---
<!-- _class: title-layout -->
<!-- _paginate: false -->
# mabl-cosme
### 生成AI系SaaSを模したE2Eテストデモアプリ

---
<!-- class: body-layout -->
# アプリケーション概要

## mabl-cosmeとは

- **目的**: mabl + LLM による「UIコード生成」「自動テスト生成」のデモ題材
- **特徴**:
  - 生成AI系コスメ/ビジュアルSaaSを模したSPA
  - **JWT認証**付きAPI（mablのAPIテストデモに最適）
  - **data-testid**による安定したセレクタ設計
  - 多言語対応（日本語/英語/中国語）

---

# ワークフロー

## 典型的なSaaSワークフローを再現

1. **ログイン**（JWT認証）
2. **画像アップロード**（製品写真などを想定）
3. **AI背景生成**（DALL-E 3 API呼び出し）
4. **背景と元画像の合成**（Canvas API）
5. **色調補正**（色温度/彩度）
6. **保存・ダウンロード**
7. **ギャラリー表示**

---

# アーキテクチャ

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | React 18 + TypeScript + Vite |
| スタイリング | Tailwind CSS (CDN) |
| バックエンド | Node.js + Express |
| 認証 | JWT (jsonwebtoken) |
| AI統合 | OpenAI DALL-E 3 |
| デプロイ | Docker + Google Cloud Run |

---

# JWT認証フロー

## サーバーサイド認証の実装

```
1. POST /api/login (username, password)
   ↓
2. サーバーがJWTトークンを返却 { token: "eyJhbG..." }
   ↓
3. POST /api/openai (Authorization: Bearer <token>)
   ↓
4. OpenAI API呼び出し → 結果返却
```

- **トークン有効期限**: 24時間
- **認証エラー**: 401 Unauthorized

---

# APIエンドポイント

## mablのAPIテストで検証可能

| エンドポイント | 説明 |
|---------------|------|
| `POST /api/login` | JWT認証（トークン取得） |
| `POST /api/openai` | AI背景生成（JWT必須） |

**レスポンス例**:
- 認証成功: `{ "token": "eyJhbG..." }`
- 認証失敗: `{ "error": "Invalid credentials" }`

---

# data-testid設計

## テスト自動化のためのセレクタ

- **目的**: mablやPlaywrightがUI要素を一意に検出
- **命名規則**:
  - ボタン: `btn-{action}` (例: `btn-login`, `btn-save`)
  - 入力: `{name}` (例: `username`, `password`)
  - セレクト: `{name}-select` (例: `lang-select`)

**ポイント**: CSSクラスやDOM構造が変わっても、data-testidは安定

---

# 主要なdata-testid一覧

## mablテストで使用するセレクタ

| カテゴリ | data-testid | 説明 |
|---------|-------------|------|
| 認証 | `username` | ユーザー名入力 |
| 認証 | `password` | パスワード入力 |
| 認証 | `btn-login` | ログインボタン |
| 認証 | `login-error` | エラー表示 |
| 画像 | `btn-upload` | アップロード |
| 画像 | `btn-ai-generate` | AI生成 |
| 保存 | `btn-save` | 保存ボタン |

---

# テストシナリオ A

## 基本E2Eフロー

1. アプリを開く
2. ユーザー名・パスワードを入力 → ログイン
3. 画像をアップロード
4. 「背景をAIで生成」ボタン押下
5. 色温度・彩度スライダーで調整
6. 「保存」ボタン押下 → ギャラリーに追加
7. 「ダウンロード」でPNGを保存

---

# テストシナリオ A'

## 認証エラー

1. アプリを開く
2. **不正な**ユーザー名・パスワードを入力
3. `login-error` に "Invalid credentials" 表示
4. 正しい認証情報を入力 → ログイン成功

**検証ポイント**: エラーメッセージの表示確認

---

# その他のテストシナリオ

## シナリオ B〜E

| シナリオ | 内容 |
|---------|------|
| B: 多言語確認 | 言語切替でUI変化を確認 |
| C: 入力エラー | 10MB超/非画像ファイルのエラー |
| D: 画像なし操作 | 画像未選択でのアラート確認 |
| E: APIサーバー切替 | 同一/別ホストの切替 |

---

# 環境変数

## 設定項目

| 変数名 | 説明 | デフォルト |
|--------|------|-----------|
| `OPENAI_API_KEY` | OpenAI APIキー | (必須) |
| `AUTH_USERNAME` | ログイン用ユーザー名 | `demo` |
| `AUTH_PASSWORD` | ログイン用パスワード | `demo123` |
| `JWT_SECRET` | JWT署名用シークレット | (自動生成) |

---

# デプロイ

## GitHub Actions + Cloud Run

```
main ブランチへのpush
    ↓
GitHub Actions トリガー
    ↓
Docker イメージをビルド
    ↓
Artifact Registry にプッシュ
    ↓
Cloud Run にデプロイ
```

---

# 開発コマンド

## ローカル開発

```bash
# 開発サーバー起動（フロント＋バック同時）
npm run dev:all

# Docker で起動
docker compose up -d --build

# ビルド
npm run build
```

---

# まとめ

## mabl-cosmeの特徴

- **JWT認証**: サーバーサイドJWT認証によるセキュアなAPI
- **実際のAI連携**: DALL-E 3 APIによる背景生成
- **テスタブル設計**: data-testidによる安定したセレクタ
- **多言語対応**: 日本語/英語/中国語
- **クラウドデプロイ**: Docker + Cloud Run + GitHub Actions

---
<!-- _class: blank-layout -->
<!-- _paginate: false -->
# ご清聴ありがとうございました！
