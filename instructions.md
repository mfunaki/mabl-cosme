# 開発ガイドライン

このドキュメントは、mabl-cosmeプロジェクトの開発における規約とベストプラクティスを定義します。

## 目次

1. [アーキテクチャ概要](#アーキテクチャ概要)
2. [ディレクトリ構造](#ディレクトリ構造)
3. [開発フロー](#開発フロー)
4. [コーディング規約](#コーディング規約)
5. [テスト戦略と実装指針](#テスト戦略と実装指針)
6. [国際化(i18n)](#国際化i18n)
7. [data-testid規約](#data-testid規約)

---

## アーキテクチャ概要

### フロントエンド

```
React + TypeScript + Vite
```

- **状態管理**: React Hooks (useState, useContext)
- **スタイリング**: Tailwind CSS (CDN)
- **画像処理**: Canvas API
- **国際化**: React Context + 翻訳辞書

### バックエンド

```
Node.js + Express
```

- **静的ファイル配信**: Express (本番環境)
- **APIエンドポイント**: `/api/login`, `/api/openai`
- **認証**: JWT認証（アプリケーション認証）、Basic認証（オプション）

### 通信フロー

```
[Browser] → [Vite Dev Server (5173)] → [Express API (3000)] → [OpenAI API]
              ↓ (本番時)
         [Express (3000)] が静的ファイル配信も兼務
```

### 認証フロー

```
1. POST /api/login (username, password)
   ↓
2. サーバーがJWTトークンを返却 { token: "eyJhbG..." }
   ↓
3. POST /api/openai (Authorization: Bearer <token>)
   ↓
4. OpenAI API呼び出し → 結果返却
```

---

## ディレクトリ構造

```
src/
├── App.tsx                 # ルートコンポーネント (状態管理・レイアウト)
├── main.tsx                # エントリーポイント
├── components/             # UIコンポーネント
│   ├── Header.tsx          # ヘッダー (環境/言語/APIサーバー選択)
│   ├── AuthSection.tsx     # 認証フォーム
│   ├── ImageEditor.tsx     # 画像編集 (アップロード/AI生成/色調補正)
│   ├── Gallery.tsx         # ギャラリー (保存済み画像一覧)
│   ├── index.ts            # エクスポート集約
│   └── __tests__/          # コンポーネントテスト
├── hooks/                  # カスタムフック (将来拡張用)
├── services/               # 外部サービス連携
│   ├── api.ts              # API呼び出し関数
│   └── __tests__/
├── utils/                  # ユーティリティ関数
│   ├── imageProcessor.ts   # 画像処理 (Canvas操作)
│   └── __tests__/
├── constants/              # 定数定義
│   ├── config.ts           # アプリ設定値
│   └── __tests__/
├── i18n/                   # 国際化
│   ├── translations.ts     # 翻訳辞書
│   ├── types.ts            # 翻訳キーの型定義
│   └── __tests__/
└── contexts/               # React Context
    ├── LanguageContext.tsx # 言語切り替えContext
    ├── AuthContext.tsx     # 認証状態管理Context（JWTトークン）
    └── __tests__/

server/
├── index.js                # Expressサーバーメイン
├── proxy.js                # APIルート (/api/login, /api/openai)
└── auth.js                 # JWT認証ロジック
```

---

## 開発フロー

### テスト駆動開発 (TDD)

このプロジェクトではTDDを採用しています。詳細は[テスト戦略と実装指針](#テスト戦略と実装指針)を参照。

```
1. Playwrightテストを書く (Red)
   ↓
2. テストが失敗することを確認
   ↓
3. 最小限の実装でテストを通す (Green)
   ↓
4. リファクタリング (Refactor)
   ↓
5. 繰り返し
   ↓
6. 機能完成後、必要に応じてmablでE2Eテストを作成
```

**重要**: 単体テストはPlaywright、E2Eテストはmablと役割を明確に分離する。

### ブランチ戦略

```
main          # 本番環境 (Cloud Runに自動デプロイ)
└── feature/* # 機能開発ブランチ
```

### コミットメッセージ

```
<type>: <subject>

# type:
#   feat     新機能
#   fix      バグ修正
#   refactor リファクタリング
#   test     テスト追加/修正
#   docs     ドキュメント
#   chore    ビルド/設定変更
```

---

## コーディング規約

### TypeScript

```typescript
// 型は明示的に定義
type Props = {
  value: string
  onChange: (value: string) => void
}

// 関数コンポーネントはアロー関数
const MyComponent = ({ value, onChange }: Props) => {
  // ...
}

// export default は関数宣言で
export default function App() {
  // ...
}
```

### 定数

マジックナンバーは `src/constants/config.ts` に集約:

```typescript
// Bad
const canvas = { width: 1024, height: 1024 }

// Good
import { IMAGE_CONFIG } from './constants/config'
const canvas = IMAGE_CONFIG.canvas
```

### コンポーネント設計

```typescript
// 1. Props型を先に定義
type Props = {
  items: Item[]
  onSelect: (item: Item) => void
}

// 2. コンポーネント本体
const ItemList = ({ items, onSelect }: Props) => {
  // 3. 状態は上部にまとめる
  const [selected, setSelected] = useState<Item | null>(null)

  // 4. ハンドラー関数
  const handleClick = (item: Item) => {
    setSelected(item)
    onSelect(item)
  }

  // 5. JSXを返す
  return (
    <ul>
      {items.map(item => (
        <li key={item.id} onClick={() => handleClick(item)}>
          {item.name}
        </li>
      ))}
    </ul>
  )
}
```

---

## テスト戦略と実装指針

プロジェクトの品質管理において、以下の役割分担を厳守すること。

### テストピラミッド

```
        ┌─────────┐
        │  E2E    │  ← mabl (ユーザーワークフロー)
        │ (mabl)  │
       ┌┴─────────┴┐
       │   単体     │  ← Playwright (モジュール単位)
       │(Playwright)│
      └─────────────┘
```

### 1. 単体テスト (Unit / Component Testing)

| 項目 | 内容 |
|------|------|
| **ツール** | Playwright |
| **格納場所** | 対象ソースファイルと同じディレクトリ内の `__tests__/` フォルダ |
| **命名規則** | `[ファイル名].spec.ts` または `[ファイル名].spec.tsx` |
| **レポート** | mabl Playwright Reporter (`@mablhq/playwright-reporter`) |

#### ファイル配置例

```
src/
├── components/
│   ├── Header.tsx
│   └── __tests__/
│       └── Header.spec.ts    # Header.tsxの単体テスト
├── utils/
│   ├── imageProcessor.ts
│   └── __tests__/
│       └── imageProcessor.spec.ts
```

#### 実装基準

- 各モジュールのロジック、関数、UIコンポーネントの単体動作を検証する
- 外部APIや副作用がある場合は、Playwrightの `route` や `mock` 機能を使用して隔離する
- 正常系・異常系・境界値を網羅する

#### テストの書き方

```typescript
import { test, expect } from '@playwright/test'

test.describe('Header Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  // 正常系
  test('should render app title', async ({ page }) => {
    await expect(page.getByTestId('app-title')).toBeVisible()
  })

  // 異常系
  test('should show error on invalid input', async ({ page }) => {
    await page.getByTestId('input').fill('')
    await page.getByTestId('submit').click()
    await expect(page.getByTestId('error')).toBeVisible()
  })

  // 外部APIのモック
  test('should handle API error gracefully', async ({ page }) => {
    await page.route('**/api/openai', route => {
      route.fulfill({ status: 500, body: 'Server Error' })
    })
    // エラーハンドリングの検証
  })
})
```

#### テストコマンド

```bash
# テスト実行
npm run test

# UIモードで実行 (デバッグ向け)
npm run test:ui

# レポート表示
npm run test:report
```

### 2. E2Eテスト (End-to-End Testing)

| 項目 | 内容 |
|------|------|
| **ツール** | mabl |
| **管理場所** | mabl クラウド |
| **実行方法** | mabl CLI または mabl ダッシュボード |

#### 実装基準

- ユーザーの実際のワークフロー、画面遷移、統合的な動作を検証する
- ブラウザ上での複雑なアサーションや、複数画面にまたがるシナリオはmablで管理する
- Claude Codeは `mabl CLI` を活用し、必要に応じて既存テストの実行や新規テストの要件定義を行う

#### mabl CLIの使用例

```bash
# テスト一覧の取得
mabl tests list

# テストの実行
mabl tests run --id <test-id>

# デプロイメントイベントの送信
mabl deployments create --application-id <app-id> --environment-id <env-id>
```

#### Playwright vs mabl の使い分け

| 観点 | Playwright (単体テスト) | mabl (E2Eテスト) |
|------|------------------------|------------------|
| スコープ | 単一コンポーネント/関数 | ユーザーワークフロー全体 |
| 実行速度 | 高速 | 中速 |
| メンテナンス | 開発者がコードで管理 | QAチームがUIで管理 |
| 適用シナリオ | ロジック検証、回帰テスト | 統合テスト、クロスブラウザ |
| モック | 積極的に使用 | 実環境に近い状態で実行 |

### 3. テストの自律実行

コード修正・リファクタリング後は、以下のフローを**必ず**実行すること。

```
コード修正
    ↓
npm run test (Playwright単体テスト実行)
    ↓
  ┌─────────────────┐
  │ テスト結果確認   │
  └─────────────────┘
    ↓           ↓
  成功         失敗
    ↓           ↓
  完了      原因分析
              ↓
          コードまたは
          テストを修正
              ↓
          再実行 (ループ)
```

#### 自律実行のルール

1. **修正後は必ずテスト実行**: 関連するPlaywright単体テストを実行し、パスを確認
2. **失敗時は自律修正**: テスト失敗の原因を分析し、コードまたはテストを修正
3. **全テストパスまで継続**: すべてのテストがパスするまで修正を繰り返す
4. **mablテストへの影響確認**: `data-testid`を変更した場合はmablテストへの影響を報告

---

## 国際化(i18n)

### 対応言語

| コード | 言語   |
|--------|--------|
| `ja`   | 日本語 |
| `en`   | English |
| `zh`   | 中文   |

### 翻訳の追加

1. `src/i18n/types.ts` に型を追加:

```typescript
export type TranslationKey =
  | 'appTitle'
  | 'newKey'  // 追加
```

2. `src/i18n/translations.ts` に翻訳を追加:

```typescript
export const translations: Translations = {
  ja: {
    appTitle: 'ワークフロー',
    newKey: '新しいキー',  // 追加
  },
  en: {
    appTitle: 'Workflow',
    newKey: 'New Key',  // 追加
  },
  zh: {
    appTitle: '工作流',
    newKey: '新键',  // 追加
  },
}
```

3. コンポーネントで使用:

```typescript
import { useLanguage } from '../contexts/LanguageContext'

const MyComponent = () => {
  const { t } = useLanguage()
  return <span>{t('newKey')}</span>
}
```

---

## data-testid規約

### 目的

`data-testid`属性は、mablやPlaywrightがテスト時にUI要素を一意に検出するために使用します。
CSSクラスやDOM構造はデザイン変更で頻繁に変わる可能性がありますが、`data-testid`はテスト専用の属性として安定したセレクターを提供します。

**すべての操作可能な要素**（ボタン、入力フィールド、セレクトボックスなど）には`data-testid`属性を付与してください。

### 使用ツール

`data-testid`属性は**Playwright単体テスト**と**mabl E2Eテスト**の両方で使用されます。
既存の`data-testid`を変更すると両方のテストに影響するため、変更は慎重に行ってください。

### 変更時の影響範囲

| 変更内容 | Playwright | mabl |
|----------|------------|------|
| `data-testid`の追加 | テスト追加が必要 | テスト追加が必要 |
| `data-testid`の削除 | テスト修正が必要 | テスト修正が必要 |
| `data-testid`の変更 | テスト修正が必要 | テスト修正が必要 |

**重要**: `data-testid`を変更した場合は、Playwrightテストを修正した上で、mablテストへの影響も報告すること。

### 命名規則

```
btn-{action}      # ボタン: btn-login, btn-save, btn-upload
input-{name}      # 入力: email, password (inputプレフィックスなし)
slider-{name}     # スライダー: slider-temp, slider-sat
select-{name}     # セレクト: env-select, lang-select
{section}-{item}  # セクション内要素: gallery-id-{id}
```

### 主要なdata-testid一覧

| カテゴリ | data-testid | 説明 |
|----------|-------------|------|
| 認証 | `username` | ユーザー名入力 |
| 認証 | `password` | パスワード入力 |
| 認証 | `btn-login` | ログインボタン |
| 認証 | `btn-logout` | ログアウトボタン |
| 認証 | `api-server-select` | APIサーバー選択（ログイン画面） |
| 認証 | `login-error` | ログインエラー表示 |
| 画像 | `btn-upload` | アップロードボタン |
| 画像 | `img-preview` | プレビュー画像 |
| 画像 | `btn-ai-generate` | AI生成ボタン |
| 画像 | `ai-prompt` | AIプロンプト入力 |
| 色調 | `slider-temp` | 色温度スライダー |
| 色調 | `slider-sat` | 彩度スライダー |
| 色調 | `btn-apply` | 適用ボタン |
| 保存 | `btn-save` | 保存ボタン |
| 保存 | `btn-download` | ダウンロードボタン |
| 保存 | `api-payload` | APIペイロード表示 |
| ギャラリー | `gallery-id-{id}` | ギャラリーアイテム |
| ヘッダー | `app-title` | アプリタイトル |
| ヘッダー | `env-select` | 環境セレクター |
| ヘッダー | `lang-select` | 言語セレクター |
| ヘッダー | `api-server-select` | APIサーバーセレクター |

### 新規追加時の注意

```tsx
// Good: 一貫した命名
<button data-testid="btn-reset">リセット</button>

// Bad: 不一致な命名
<button data-testid="resetButton">リセット</button>
<button data-testid="reset">リセット</button>
```

---

## トラブルシューティング

### Playwrightテスト関連

**Q: Playwrightテストが失敗する**

```bash
# Playwrightブラウザを再インストール
npx playwright install

# キャッシュをクリア
rm -rf node_modules/.cache

# 特定のテストのみ実行してデバッグ
npm run test -- --grep "テスト名"

# UIモードでステップ実行
npm run test:ui
```

**Q: テストがタイムアウトする**

```bash
# タイムアウトを延長して実行
npm run test -- --timeout=60000

# 開発サーバーが起動しているか確認
curl http://localhost:5173
```

### mabl関連

**Q: mabl CLIが動作しない**

```bash
# mabl CLIのインストール確認
mabl --version

# 認証状態の確認
mabl auth status

# 再認証
mabl auth login
```

**Q: mablテストでdata-testidが見つからない**

1. Playwrightテストで同じ`data-testid`が動作するか確認
2. 要素が動的に生成される場合は、適切な待機処理を追加
3. `data-testid`が変更されていないか履歴を確認

### 開発環境関連

**Q: 型エラーが発生する**

```bash
# TypeScriptの型チェック
npx tsc --noEmit

# node_modulesを再インストール
rm -rf node_modules && npm install
```

**Q: 開発サーバーが起動しない**

```bash
# ポートが使用中か確認
lsof -i :5173
lsof -i :3000

# プロセスを終了
kill -9 <PID>
```

---

## 参考リンク

### 開発ツール

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

### テストツール

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [mabl Documentation](https://help.mabl.com/)
- [mabl CLI Reference](https://help.mabl.com/docs/mabl-cli)
- [mabl Playwright Reporter](https://www.npmjs.com/package/@mablhq/playwright-reporter)
