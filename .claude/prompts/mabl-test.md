# mabl テスト作成プロンプト

## 目的
mabl を使用した E2E テストを設計・作成する。

## 前提条件

このプロジェクト（mabl-cosme）には以下の data-testid が定義されています：

### ヘッダー（ログイン後）
| data-testid | 要素 | 説明 |
|-------------|------|------|
| `app-title` | h1 | アプリタイトル |
| `lang-select` | select | 言語選択（ja/en/zh） |
| `api-server-select` | select | APIサーバー選択 |
| `btn-logout` | button | ログアウトボタン |

### 認証（ログイン画面）
| data-testid | 要素 | 説明 |
|-------------|------|------|
| `app-title` | h1 | アプリタイトル |
| `api-server-select` | select | APIサーバー選択 |
| `username` | input | ユーザー名入力 |
| `password` | input | パスワード入力 |
| `login-error` | p | ログインエラー表示 |
| `btn-login` | button | ログインボタン |

### 画像操作
| data-testid | 要素 | 説明 |
|-------------|------|------|
| `btn-upload` | label | アップロードボタン |
| `upload-error` | span | アップロードエラー表示 |
| `img-preview` | img/canvas | プレビュー画像 |
| `ai-prompt` | textarea | AIプロンプト入力 |
| `btn-ai-generate` | button | AI背景生成ボタン |
| `ai-error` | p | AIエラー表示 |

### 色調補正
| data-testid | 要素 | 説明 |
|-------------|------|------|
| `slider-temp` | input[type=range] | 色温度スライダー |
| `slider-sat` | input[type=range] | 彩度スライダー |
| `btn-apply` | button | 適用ボタン |

### 保存・出力
| data-testid | 要素 | 説明 |
|-------------|------|------|
| `btn-save` | button | 保存ボタン |
| `btn-download` | button | ダウンロードボタン |
| `api-payload` | pre | APIペイロード表示（JSON） |

### ギャラリー
| data-testid | 要素 | 説明 |
|-------------|------|------|
| `gallery-id-{id}` | span | ギャラリー画像のID |

## 認証情報

テスト環境の認証情報は環境変数で設定されています：
- **ユーザー名**: `AUTH_USERNAME`（デフォルト: `demo`）
- **パスワード**: `AUTH_PASSWORD`（デフォルト: `demo123`）

## テストシナリオテンプレート

### シナリオ A: 基本フロー（ログイン → 画像保存）
1. アプリを開く
2. ログイン（username, password 入力 → btn-login クリック）
3. 画像アップロード（btn-upload）
4. AI背景生成（ai-prompt 入力 → btn-ai-generate クリック）
5. 色調補正（slider-temp, slider-sat 操作 → btn-apply クリック）
6. 保存（btn-save クリック）
7. ギャラリー確認（gallery-id-* の存在確認）

### シナリオ A': 認証エラー
1. アプリを開く
2. **不正な**ユーザー名・パスワードを入力
3. btn-login クリック
4. `login-error` に "Invalid credentials" が表示されることを確認
5. 正しい認証情報を入力 → ログイン成功

### シナリオ B: 多言語確認
1. ログイン後、`lang-select` で言語を切り替え
2. UIテキストが切り替わることを確認
3. 各言語（ja/en/zh）で主要機能が動作することを確認

### シナリオ C: 入力エラー
1. ログイン後、10MB超の画像をアップロード
2. `upload-error` にエラーメッセージが表示されることを確認
3. 非画像ファイル（.txt等）をアップロード
4. `upload-error` にエラーメッセージが表示されることを確認

### シナリオ D: 画像なし操作
1. ログイン後、画像をアップロードせずに btn-ai-generate クリック
2. アラートが表示されることを確認

## 検証ポイント

- `api-payload` の JSON 内容を検証（保存時のペイロード確認）
- `login-error` のテキストを検証（認証エラー時）
- `ai-error` のテキストを検証（AI生成エラー時）
- `upload-error` のテキストを検証（アップロードエラー時）
- `img-preview` の表示状態を検証（画像アップロード後）
- `gallery-id-*` の存在を検証（保存後）

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

```
@.claude/prompts/mabl-test.md を使って「認証エラーの検証」テストを設計して
```

## mabl MCP コマンド

テスト作成後、以下のコマンドで mabl にテストを登録できます：

```
mcp__mabl__create_mabl_test      # テスト作成
mcp__mabl__run_mabl_test_local   # ローカル実行
mcp__mabl__run_mabl_test_cloud   # クラウド実行
```
