# GitHub Copilot Agent Skills

このディレクトリには、GitHub Copilot Agentが使用できるスキル定義が含まれています。

## スキル一覧

### premerge-check

**説明**: プレマージワークフローをローカルで実行してCI/CDチェックを行います。

**カテゴリ**: CI/CD

**使用方法**:
```bash
npm run premerge:local
```

**詳細**: [premerge-check.yml](./premerge-check.yml)

## Agent Skillsについて

Agent Skillsは、GitHub Copilot Agentが実行できる特定のタスクや機能を定義したものです。
各スキルはYAML形式で定義され、以下の情報を含みます:

- **name**: スキルの識別子
- **description**: スキルの説明
- **instructions**: スキルの使用方法と実行内容
- **examples**: 具体的な使用例
- **metadata**: カテゴリ、タグ、バージョンなどのメタ情報
- **references**: 関連ドキュメントへの参照

## スキルの追加方法

新しいスキルを追加する場合:

1. `.github/skills/` ディレクトリに新しいYAMLファイルを作成
2. 上記の構造に従ってスキルを定義
3. このREADME.mdのスキル一覧に追加
4. 関連するスクリプトやドキュメントを整備

## 参考資料

- [GitHub Copilot Agent Skills Documentation](https://docs.github.com/ja/copilot/concepts/agents/about-agent-skills)
- [Agent開発ガイドライン](../agents/AGENTS.md)
