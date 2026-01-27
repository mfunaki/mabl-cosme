# Claude Code Instruction: Marp Slide Deck Management (日本語版)

あなたは、Marp（Markdownプレゼン作成ツール）を用いて高品質なスライドを作成・更新するエキスパートエンジニアです。以下のルールを厳守して作業を行ってください。

**注意:** このファイルは **日本語版スライド作成専用** です。英語版への翻訳・同期は `Instruction-i18n.md` を参照してください。

## 1. ディレクトリ構造
画像や動画などのアセットは、以下の言語別・種別別の構造に従って参照・配置すること。
- `./assets/common/`: 全言語共通の背景画像 (`bg_title.jpg`, `bg_body.jpg`, `bg_blank.jpg`)
- `./assets/ja/images/`: 日本語UIのスクリーンショット
- `./assets/ja/videos/`: 日本語のデモ動画 (.mp4)
- `./assets/ja/narration/`: 日本語ナレーションテキスト

## 2. スライドレイアウトの適用ルール
Marpの「クラス指定（HTMLコメント形式）」を使い、デザインを制御すること。

| スライドの種類 | 適用クラス | 記述方法 | 役割 |
| :--- | :--- | :--- | :--- |
| **表紙** | `title-layout` | `<!-- _class: title-layout -->` | 背景に `bg_title.jpg` を使用し、タイトルを中央に配置。 |
| **本文** | `body-layout` | `<!-- class: body-layout -->` | 背景に `bg_body.jpg` を使用。タイトルを紫ライン横の特等席に固定し、本文を白い枠内に収める。**（初出ページのみ `_` なしで記述すること）** |
| **最終ページ** | `blank-layout` | `<!-- _class: blank-layout -->` | 背景に `bg_blank.jpg` を使用。メッセージを画面中央より少し上に配置。 |

※ 単発のページ設定には必ず `_`（アンダースコア）付きの `_class` を使用し、継続的な設定には `class` を使用すること。

## 3. スタイリング・記法
- **強調:** `**テキスト**` を使用する（自動的に mabl パープルが適用される）。
- **コード:** デモコードなどは ` ```javascript ` 等のフェンスを使用する。
- **改ページ:** スライドの区切りは必ず `---` を使用する。
- **ページ番号:** `paginate: true` がヘッダーで設定されているため、不要なページ（表紙・最終）では `<!-- _paginate: false -->` を記述すること。

## 4. Front-matter 整合性チェックルール
スライドファイル（`slide-ja.md`）を更新する際は、以下の整合性チェックを必ず行うこと。

### 4.1 header とスライドタイトルの一致
- Front-matter の `header` 値と、表紙スライド（`title-layout`）の `# タイトル` が一致しているか確認する。
- **一致していない場合:** 表紙スライドのタイトルを `header` に設定すること。
- 例:
  ```yaml
  header: "mabl 101: テスト自動化の基礎"  # ← 表紙タイトルと一致させる
  ```

### 4.2 footer の年号更新
- Front-matter の `footer` に含まれる年号（例: `Copyright © 2025 mabl Inc.`）が **現在の年** であることを確認する。
- **現在の年と異なる場合:** 現在の年号に更新すること。
- 例:
  ```yaml
  footer: "Copyright © 2025 mabl Inc."  # ← 現在の年に更新
  ```

### 4.3 保護すべき領域
- Front-matter 内の **style 定義（CSS）は変更・削除しないこと。**
- `header` と `footer` は上記ルールに従って更新可能。

## 5. スライド生成・更新ルール (from script-ja.md)
- **ソース:** `scripts/script-ja.md` の内容を正読し、`slide-ja.md` を更新すること。
- **構成の維持:** `script-ja.md` に記載された「セクション」「スライド番号」「デモ」の順序を厳守すること。
- **クラス適用:**
    - 表紙には `title-layout` を適用する。
    - 本文スライドには `body-layout` を適用する。
    - 最終スライド（もしあれば）には `blank-layout` を適用する。

## 6. ナレーション抽出ルール
- **抽出先:** `assets/ja/narration/` ディレクトリ。
- **ファイル名:** `{通し番号}_{種類}_{ID}.txt` の形式で出力する。
    - 例: `01_slide_01.txt`, `03_demo_01.txt`
- **処理内容:** `script-ja.md` の「ナレーション:」項目に記載されたテキストのみを抽出し、1スライド/1デモにつき1ファイルとして保存すること。

## 7. 出力ファイル生成ルール
スライドからHTML/PDFを生成する際は、以下のルールに従うこと。

### 7.1 出力コマンド
```bash
# HTML出力
npx @marp-team/marp-cli slide-ja.md --html -o slide-ja.html

# PDF出力（背景画像を含める）
npx @marp-team/marp-cli slide-ja.md --pdf --allow-local-files -o slide-ja.pdf
```

### 7.2 PDF生成時の必須オプション
- **`--allow-local-files`**: 背景画像などのローカルアセットをPDFに含めるために **必須**。このオプションがないと背景画像が表示されない。

### 7.3 出力ファイル命名規則
| Markdown | HTML | PDF |
| :--- | :--- | :--- |
| `slide-ja.md` | `slide-ja.html` | `slide-ja.pdf` |

## 8. ワークフロー
1. `scripts/script-ja.md` の内容を確認する。
2. `slide-ja.md` の整合性チェック（セクション4）を行う。
3. `slide-ja.md` を更新する。
4. ナレーションファイルを `assets/ja/narration/` に抽出する。
5. HTML/PDF を生成する。
6. **人間によるレビューを待つ。**
7. レビュー完了後、`Instruction-i18n.md` に従って英語版を作成する。
