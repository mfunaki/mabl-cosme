# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 概要

mabl（テスト自動化プラットフォーム）を紹介するための、Marpベースの多言語プレゼンテーションプロジェクト。MarkdownでスライドをMarpを使用して作成・表示する。

## コマンド

```bash
# プレビュー（Marp CLI必須）
npx @marp-team/marp-cli slide-ja.md --preview
npx @marp-team/marp-cli slide-en.md --preview

# PDF出力
npx @marp-team/marp-cli slide-ja.md --pdf
npx @marp-team/marp-cli slide-en.md --pdf

# HTML出力
npx @marp-team/marp-cli slide-ja.md --html
npx @marp-team/marp-cli slide-en.md --html
```

## ファイル構成

- `slide-ja.md` - 日本語スライド（マスターファイル）
- `slide-en.md` - 英語スライド（同期翻訳版）
- `glossary-mabl.md` - mabl公式用語の日英対応表
- `instructions.md` - Marpスライド作成の詳細ルール
- `assets/common/` - 共通背景画像（`bg_title.jpg`, `bg_body.jpg`, `bg_blank.jpg`）
- `assets/ja/` - 日本語用アセット（スクリーンショット、動画）
- `assets/en/` - 英語用アセット（スクリーンショット、動画）

## スライドレイアウトクラス

| レイアウト | クラス | 記述方法 |
| :--- | :--- | :--- |
| 表紙 | `title-layout` | `<!-- class: title-layout -->` |
| 本文 | `body-layout` | `<!-- class: body-layout -->`（初出は`_`なし） |
| 最終ページ | `blank-layout` | `<!-- _class: blank-layout -->`（単発設定は`_`付き） |

## 多言語対応ワークフロー

1. `slide-ja.md` をマスターファイルとして編集
2. 同じ構造を維持しつつ `slide-en.md` に変更を同期
3. **翻訳時は必ず `glossary-mabl.md` を参照**してmabl固有用語の訳語を確認
4. アセットパスを `/ja/` から `/en/` に適切に変更
