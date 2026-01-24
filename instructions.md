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
- **APIプロキシ**: `/api/openai` → OpenAI API
- **認証**: Basic認証 (オプション)

### 通信フロー

```
[Browser] → [Vite Dev Server (5173)] → [Express API (3000)] → [OpenAI API]
              ↓ (本番時)
         [Express (3000)] が静的ファイル配信も兼務
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
    └── __tests__/

server/
├── index.js                # Expressサーバーメイン
└── proxy.js                # OpenAI APIプロキシ
```

---

## 開発フロー

### テスト駆動開発 (TDD)

このプロジェクトではTDDを採用しています。

```
1. テストを書く (Red)
   ↓
2. テストが失敗することを確認
   ↓
3. 最小限の実装でテストを通す (Green)
   ↓
4. リファクタリング (Refactor)
   ↓
5. 繰り返し
```

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

## テスト方針

### テストフレームワーク

- **E2Eテスト**: Playwright
- **レポート**: mabl Playwright Reporter

### テストファイル配置

```
src/
├── components/
│   ├── Header.tsx
│   └── __tests__/
│       └── Header.spec.ts    # Header.tsxのテスト
├── utils/
│   ├── imageProcessor.ts
│   └── __tests__/
│       └── imageProcessor.spec.ts
```

### テストの書き方

```typescript
import { test, expect } from '@playwright/test'

test.describe('コンポーネント名', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  // 正常系
  test('should render correctly', async ({ page }) => {
    await expect(page.getByTestId('element-id')).toBeVisible()
  })

  // 異常系
  test('should show error on invalid input', async ({ page }) => {
    await page.getByTestId('input').fill('')
    await page.getByTestId('submit').click()
    await expect(page.getByTestId('error')).toBeVisible()
  })
})
```

### テストコマンド

```bash
# テスト実行
npm run test

# UIモードで実行
npm run test:ui

# レポート表示
npm run test:report
```

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

mablテストとの互換性を維持するため、`data-testid`属性は変更しないでください。

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
| 認証 | `email` | メールアドレス入力 |
| 認証 | `password` | パスワード入力 |
| 認証 | `btn-login` | ログインボタン |
| 認証 | `btn-logout` | ログアウトボタン |
| 認証 | `login-state` | ログイン状態表示 |
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

### よくある問題

**Q: テストが失敗する**

```bash
# Playwrightブラウザを再インストール
npx playwright install

# キャッシュをクリア
rm -rf node_modules/.cache
```

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

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Playwright Documentation](https://playwright.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [mabl Documentation](https://help.mabl.com/)
