# Development Container Configuration

このディレクトリには、勤怠管理システム開発環境のDevContainerの設定が含まれています。

## 概要

DevContainerを使用することで、以下のメリットがあります：

- ✅ 一貫した開発環境
- ✅ 自動セットアップ
- ✅ ローカル開発とCopilot Agentの両方で使用可能
- ✅ 将来の依存関係も簡単に追加可能

## 設定内容

### ベースイメージ

```
mcr.microsoft.com/devcontainers/typescript-node:24
```

- Node.js 24
- TypeScript開発環境

### VS Code 拡張機能

- GitHub Copilot
- GitHub Copilot Chat

## 使用方法

### VS Codeでの使用

1. VS Codeで開く
2. コマンドパレット: "Dev Containers: Reopen in Container"
3. コンテナが起動し、開発環境が自動的にセットアップされます

### GitHub Copilot Coding Agentでの使用

エージェントは `.devcontainer/devcontainer.json` の設定を参照し、自動的に同じ環境を構築します。

## 新しい依存関係の追加

将来、新しいツールや依存関係が必要になった場合：

1. `devcontainer.json` の `features` を追加
2. または `postCreateCommand` を更新
3. コンテナを再ビルド: "Dev Containers: Rebuild Container"

### 例

```json
{
  "features": {
    "ghcr.io/devcontainers/features/git:1": {},
    "ghcr.io/devcontainers/features/python:1": {
      "version": "3.12"
    }
  }
}
```

## トラブルシューティング

### コンテナが起動しない

```bash
# コンテナを再ビルド
Dev Containers: Rebuild Container Without Cache
```

## 参考資料

- [VS Code DevContainers Documentation](https://code.visualstudio.com/docs/devcontainers/containers)
- [DevContainer Features](https://containers.dev/features)
- [GitHub Copilot Agent Setup](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/customize-the-agent-environment)
