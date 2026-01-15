# GitHub Copilot Agent Skills

このディレクトリには、GitHub Copilot Agentが使用できるスキル定義が含まれています。

## スキル一覧

### file-refactor

**説明**: ファイルやフォルダの名称変更・削除を行い、リポジトリ内の参照箇所を自動的に検索して更新します。

**使用タイミング**: ファイル/フォルダのリネームや削除を行う場合

**詳細**: [file-refactor/SKILL.md](./file-refactor/SKILL.md)

### premerge-check

**説明**: プレマージワークフローをローカルで実行してCI/CDチェックを行います。

**使用方法**:
```bash
npm run premerge:local
```

**詳細**: [premerge-check/SKILL.md](./premerge-check/SKILL.md)

### rule-making

**説明**: 「ルール化してください」というリクエストに対応し、ルールの内容に応じて適切な記載箇所を特定します。

**使用タイミング**: ユーザーからルール化・規約化のリクエストがあった場合

**詳細**: [rule-making/SKILL.md](./rule-making/SKILL.md)

## Agent Skillsについて

Agent Skillsは、GitHub Copilot Agentが実行できる特定のタスクや機能を定義したものです。
各スキルは専用のディレクトリに配置され、`SKILL.md` ファイルで定義されます。

### スキルファイルの構造

`SKILL.md` ファイルは、YAML frontmatterを含むMarkdownファイルです:

- **YAML frontmatter**:
  - `name` (必須): スキルのユニークな識別子（小文字、スペースはハイフン）
  - `description` (必須): スキルの説明と使用タイミング
  - `license` (省略可能): ライセンス情報
- **Markdown本文**: Copilotが従うべき指示、例、ガイドライン

### ディレクトリ構造

```
.github/skills/
├── README.md               # このファイル
├── file-refactor/          # ファイル/フォルダのリネーム・削除スキル
│   └── SKILL.md            # スキル定義ファイル
├── premerge-check/         # プレマージチェックスキル
│   └── SKILL.md            # スキル定義ファイル
└── rule-making/            # ルール化スキル
    └── SKILL.md            # スキル定義ファイル
```

## スキルの追加方法

新しいスキルを追加する場合:

1. `.github/skills/` 配下に新しいディレクトリを作成（小文字、ハイフン区切り）
2. そのディレクトリ内に `SKILL.md` ファイルを作成
3. YAML frontmatterとMarkdown本文を記述
4. このREADME.mdのスキル一覧に追加
5. 必要に応じてスクリプトや例をディレクトリに追加

## 参考資料

- [GitHub Copilot Agent Skills Documentation](https://docs.github.com/ja/copilot/concepts/agents/about-agent-skills)
- [Agent Skills Open Standard](https://github.com/agentskills/agentskills)
- [Agent開発ガイドライン](../agents/AGENTS.md)
