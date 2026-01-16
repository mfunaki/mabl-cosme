# mabl テスト作成プロンプト

## 目的
mabl を使用した E2E テストを設計・作成する。

## 前提条件

このプロジェクト（mabl-cosme）には以下の data-testid が定義されています：

### ヘッダー
| data-testid | 要素 | 説明 |
|-------------|------|------|
| `app-title` | h1 | アプリタイトル |
| `env-select` | select | 環境選択 |
| `lang-select` | select | 言語選択 |
| `api-server-select` | select | APIサーバー選択 |

### 認証
| data-testid | 要素 | 説明 |
|-------------|------|------|
| `email` | input | メールアドレス |
| `password` | input | パスワード |
| `btn-login` | button | ログインボタン |
| `btn-logout` | button | ログアウトボタン |
| `login-state` | span | ログイン状態 |

### 画像操作
| data-testid | 要素 | 説明 |
|-------------|------|------|
| `btn-upload` | label | アップロードボタン |
| `img-preview` | img | プレビュー画像 |
| `ai-prompt` | textarea | AIプロンプト入力 |
| `btn-ai-generate` | button | AI背景生成 |
| `ai-error` | p | AIエラー表示 |

### 色調補正
| data-testid | 要素 | 説明 |
|-------------|------|------|
| `slider-temp` | input | 色温度スライダー |
| `slider-sat` | input | 彩度スライダー |
| `btn-apply` | button | 適用ボタン |

### 保存・出力
| data-testid | 要素 | 説明 |
|-------------|------|------|
| `btn-save` | button | 保存ボタン |
| `btn-download` | button | ダウンロードボタン |
| `api-payload` | pre | APIペイロード表示 |
| `gallery-id-{id}` | span | ギャラリーID |

## テストシナリオテンプレート

### 基本フロー
1. アプリを開く
2. ログイン（email, password 入力 → btn-login クリック）
3. 画像アップロード（btn-upload）
4. AI背景生成（ai-prompt 入力 → btn-ai-generate クリック）
5. 色調補正（slider-temp, slider-sat 操作 → btn-apply クリック）
6. 保存（btn-save クリック）
7. ギャラリー確認（gallery-id-* の存在確認）

### 検証ポイント
- `api-payload` の JSON 内容を検証
- `login-state` のテキストを検証
- 画像の表示状態を検証

## 出力形式

```markdown
## テスト名
...

## テストの目的
...

## 前提条件
...

## テストステップ
1. ...
2. ...

## 期待結果
...

## 使用する data-testid
...
```

## 使用例

```
@.claude/prompts/mabl-test.md を使って「ログインから画像保存までの基本フロー」のテストを設計して
```

## mabl MCP コマンド

テスト作成後、以下のコマンドで mabl にテストを登録できます：

```
mcp__mabl__create_mabl_test
mcp__mabl__run_mabl_test_local
mcp__mabl__run_mabl_test_cloud
```
