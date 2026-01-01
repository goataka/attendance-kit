# copilot-setup-steps.yml

## 概要

GitHub Copilot Coding Agent の実行環境をセットアップするワークフロー。spec-kit CLIをインストールし、エージェントが仕様駆動開発を実行できるようにします。

## トリガー条件

### 自動実行

- このワークフローファイル自体が変更された時（プッシュまたはPR）
  - `.github/workflows/copilot-setup-steps.yml`

### 手動実行

GitHub Actionsの画面から手動で実行できます（通常は不要）。

## 目的

このワークフローは、GitHub Copilot Coding Agent が以下のタスクを実行できるように環境を準備します:
- `/specify` - 機能仕様の作成
- `/plan` - 技術計画の作成
- `/tasks` - 実装タスクの作成
- `/implement` - タスクの実装

## ワークフローステップ

### 1. uv のインストール

Python パッケージマネージャー `uv` をインストール:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### 2. spec-kit CLI のインストール

仕様駆動開発ツール `specify-cli` をインストール:
```bash
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
```

### 3. spec-kit の初期化

プロジェクトで spec-kit を使用できるように初期化:
```bash
specify init --here --ai copilot
```

### 4. 動作確認

インストールが成功したことを確認:
```bash
specify --version
```

## 使用技術

- **uv**: 高速なPythonパッケージマネージャー
- **spec-kit**: GitHub製の仕様駆動開発ツール
- **specify-cli**: spec-kitのコマンドラインインターフェース

## 実行環境

- **OS**: Ubuntu Latest
- **Python**: uvが管理（自動インストール）

## 注意事項

- このワークフローは通常、GitHub Copilot Coding Agentによって自動的に実行されます
- 手動実行は、セットアップスクリプトのテスト時のみ必要です
- DevContainerを使用している場合、このワークフローは不要です（環境が事前構築されているため）

## 関連ドキュメント

- [Spec-Kit セットアップガイド](../../docs/setup.md)
- [Agent開発ガイドライン](../../memory/agent-guidelines.md)
- [プロジェクト憲法](../../memory/constitution.md)
