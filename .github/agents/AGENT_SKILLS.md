# Agent Skills

このディレクトリには、GitHub Copilot Agent Skillsが格納されています。

## Agent Skillsとは

Agent Skillsは、GitHub Copilotコーディングエージェントが特殊なタスクを実行する能力を強化する、命令、スクリプト、およびリソースのフォルダーです。

## ディレクトリ構造

Agent skillは以下のディレクトリ構造に従います（[公式ドキュメント](https://docs.github.com/ja/copilot/concepts/agents/about-agent-skills)準拠）:

```
.github/agents/
├── AGENTS.md                    # Agent開発ガイドライン
├── AGENT_SKILLS.md              # このファイル
└── {skill-name}/                # スキルディレクトリ（小文字、ハイフン区切り）
    ├── SKILL.md                 # スキル定義ファイル（必須、この名前固定）
    ├── script.sh                # スクリプト（オプション）
    └── resources/               # リソース（オプション）
```

## スキルファイルの命名規則

**公式の命名規則**:
- スキルディレクトリ名: 小文字、スペースはハイフンで区切る（例: `localstack`, `github-actions-failure-debugging`）
- スキル定義ファイル名: **必ず `SKILL.md`**（この名前でなければならない）

## `SKILL.md`ファイルの構造

`SKILL.md`ファイルは、YAML frontmatter を含む Markdown ファイルです。

```markdown
---
name: skill-name
description: スキルの説明と、Copilotで使用すべきタイミング
license: (オプション)
---

従うべきCopilotの指示、例、ガイドラインが記載されたMarkdown本文
```

## 現在利用可能なスキル

- **localstack**: LocalStack（ローカルAWS環境）の管理スキル

## スキルの作成

1. 新しいスキル用のディレクトリを作成: `.github/agents/{skill-name}/`
2. `SKILL.md`ファイルを作成（YAML frontmatter + Markdown本文）
3. 必要に応じてスクリプトやリソースを追加

詳細は[GitHub Copilot Agent Skills公式ドキュメント](https://docs.github.com/ja/copilot/concepts/agents/about-agent-skills)を参照してください。
