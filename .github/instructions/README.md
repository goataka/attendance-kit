# コーディングルール

このディレクトリには、GitHub Copilotが参照するコーディングルールが含まれています。

## ファイル一覧

### coding.instructions.md

一般的なコーディング原則を定義します。

- 対象: 複数の言語のコードファイル（`**/*.{sh,ts,js,tsx,jsx,py,yml}`に適用）
- 内容: 理解しやすいコードを書くための7つの観点
  - 識別子（Identifier）の原則
    - 名称：曖昧 → 明瞭
    - 役割：複数 → 単一
    - 状態：可変 → 不変
    - 参照：広域 → 局所
  - 区画（Block）の原則
    - 面積：広大 → 狭小
    - 階層：多層 → 単層
    - 秩序：雑然 → 整然

### sh.instructions.md

シェルスクリプト固有のコーディングルールとテスト規約を定義します。

- 対象: シェルスクリプトファイル（`**/*.sh`）
- 内容:
  - 基本的な記述規則（shebang、実行オプション）
  - 関数の定義と呼び出し規則
  - 引数と変数の扱い方
  - テストファイルの配置と命名規則
  - テスト関数の記述方法とテスト実行方法

### typescript.instructions.md

TypeScript固有のコーディングルールを定義します。

- 対象: TypeScriptファイル（`**/*.{ts,tsx}`）
- 内容:
  - CDK Construct構造ルール
  - コンストラクタの構造
  - ユーティリティ関数の使用
  - CloudFormation Outputs
  - フィールド変数の使用
  - Node.js バージョン要件

### markdown.instructions.md

Markdownドキュメント作成のルールを定義します。

- 対象: Markdownファイル（`**/*.md`）
- 内容:
  - ドキュメント作成の基本原則
  - READMEの推奨構造
  - コードブロックの記法
  - Mermaid図の活用

## 参照元

これらのルールは、以下から取得・参照しています:

- [goataka/shared-shell](https://github.com/goataka/shared-shell/tree/main/.github/instructions): シェルスクリプトルール
- [理解しやすいコードの書き方](https://qiita.com/goataka/items/ae1959c29036dc4929fe): コーディング原則

## GitHub Copilotでの利用

これらのファイルは`.github/copilot-instructions.md`から参照されており、GitHub Copilotがコードを生成する際に自動的に考慮されます。
