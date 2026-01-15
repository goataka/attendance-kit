# 課題管理セッション

このファイルは、エージェントセッションで管理される課題を記録します。

**作成日**: 2026-01-15  
**ステータス**: 進行中

---

## Lint・品質チェックの導入

### 目的

コード品質の向上と、プレマージチェックでの自動検証を実現するため、各種lintツールを導入する。

### 課題リスト

#### 1. markdown-lintの追加

- **概要**: Markdownファイルの品質チェックを自動化
- **対象ファイル**: 
  - READMEファイル
  - ドキュメント（`docs/`, `specs/`, `issues/` 配下）
  - 仕様書・計画書
- **実装内容**:
  - [ ] `markdownlint-cli2` または `markdownlint-cli` のインストール
  - [ ] `.markdownlint.json` 設定ファイルの作成
  - [ ] `package.json` へのlintスクリプト追加
  - [ ] `.github/workflows/premerge.yml` への統合
  - [ ] ルートとワークスペースでの実行確認
- **参考**:
  - [markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2)
  - [markdownlint rules](https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md)

#### 2. shellcheckの追加

- **概要**: シェルスクリプトの品質チェックを自動化
- **対象ファイル**: 
  - `scripts/` 配下のシェルスクリプト
  - GitHub Actions ワークフロー内のシェルスクリプト
- **実装内容**:
  - [ ] `shellcheck` のインストール方法の検討（GitHub Actions環境）
  - [ ] `package.json` へのlintスクリプト追加
  - [ ] `.github/workflows/premerge.yml` への統合
  - [ ] 既存スクリプトの検証と修正
- **参考**:
  - [ShellCheck](https://github.com/koalaman/shellcheck)
  - [shellcheck GitHub Action](https://github.com/ludeeus/action-shellcheck)

#### 3. その他のlintの導入

- **概要**: 各言語・ファイルタイプに応じたlintの検討と導入
- **候補**:
  - [ ] **YAML lint**: GitHub Actions ワークフロー、設定ファイルのチェック
    - `yamllint` または `actionlint` の導入検討
  - [ ] **JSON lint**: 設定ファイルのフォーマットチェック
  - [ ] **Dockerfile lint**: Dockerfileのベストプラクティスチェック
    - `hadolint` の導入検討（DevContainer使用時）
  - [ ] **Python lint**: 将来的なPythonコードのチェック
    - `ruff` または `pylint` の導入検討（spec-kit連携時）
  - [ ] **TypeScript/JavaScript lint**: 既存のESLint設定の確認と最適化
- **実装方針**:
  - プロジェクトで実際に使用されているファイルタイプを優先
  - 段階的に導入し、既存コードへの影響を最小化
  - CI/CDへの統合は、ローカルでの検証後に実施

### 実装方針

1. **段階的な導入**: 各lintツールを個別に導入し、動作確認を行う
2. **既存コードへの配慮**: 既存のコードに対する変更を最小限に抑える
3. **設定の柔軟性**: プロジェクトの特性に応じてルールをカスタマイズ
4. **開発体験の向上**: エラーメッセージの明確化と、自動修正機能の活用

### 関連ドキュメント

- [プレマージワークフロー](../.github/workflows/premerge.yml)
- [プレマージスクリプト](../scripts/run-premerge.sh)
- [パッケージ設定](../package.json)

---

## 今後の課題

このセクションには、今後追加される課題を記録します。

