# GitHub Copilot Agent Skills

このディレクトリには、GitHub Copilot Agentが使用できるスキル定義が含まれています。

## スキル一覧

### aws-investigation

**説明**: AWS MCPを使用してAWSリソースを調査します。GitHub ActionsのOIDC認証を通じて読み取り専用でAWSに接続し、リソース情報を取得します。

**使用タイミング**: AWS環境の調査を依頼された場合

**詳細**: [aws-investigation/SKILL.md](./aws-investigation/SKILL.md)

### backend-developer

**説明**: Backend（NestJS）開発時に必要な検証を実施します。Lint、ビルド、ユニットテスト、統合テスト、OpenAPI仕様生成を含みます。

**使用タイミング**: Backend（apps/backend）のコード変更時

**詳細**: [backend-developer/SKILL.md](./backend-developer/SKILL.md)

### cloudfront-error-handler

**説明**: CloudFront配下のAPI/フロントエンドのエラーに対応し、アクセス検証、原因特定、対処、検証を体系的に行います。

**使用タイミング**: CloudFront経由のアクセスでエラーが発生した場合

**詳細**: [cloudfront-error-handler/SKILL.md](./cloudfront-error-handler/SKILL.md)

### e2e-developer

**説明**: E2E（End-to-End）テスト開発時に必要な検証を実施します。Cucumber + Playwrightによるフロントエンドとバックエンドの統合テストを含みます。

**使用タイミング**: E2Eテスト（test/e2e/）のコード変更時

**詳細**: [e2e-developer/SKILL.md](./e2e-developer/SKILL.md)

### file-refactor

**説明**: ファイルやフォルダの名称変更・削除を行い、リポジトリ内の参照箇所を自動的に検索して更新します。

**使用タイミング**: ファイル/フォルダのリネームや削除を行う場合

**詳細**: [file-refactor/SKILL.md](./file-refactor/SKILL.md)

### frontend-developer

**説明**: Frontend（React + Vite）開発時に必要な検証を実施します。Lint、ビルド、ユニットテスト、E2Eテストを含みます。

**使用タイミング**: Frontend（apps/frontend）のコード変更時

**詳細**: [frontend-developer/SKILL.md](./frontend-developer/SKILL.md)

### infrastructure-developer

**説明**: Infrastructure（AWS CDK）開発時に必要な検証を実施します。ビルド、ユニットテスト、統合テスト、CDK synthを含みます。

**使用タイミング**: Infrastructure（infrastructure/deploy）のコード変更時

**詳細**: [infrastructure-developer/SKILL.md](./infrastructure-developer/SKILL.md)

### rule-making

**説明**: 「ルール化してください」というリクエストに対応し、ルールの内容に応じて適切な記載箇所を特定します。

**使用タイミング**: ユーザーからルール化・規約化のリクエストがあった場合

**詳細**: [rule-making/SKILL.md](./rule-making/SKILL.md)

### workflow-error-handler

**説明**: ワークフローのエラーに対応し、エラーの確認、再現、原因特定、対処、検証を体系的に行います。

**使用タイミング**: GitHub Actionsワークフローの失敗やCI/CDエラーへの対応を依頼された場合

**詳細**: [workflow-error-handler/SKILL.md](./workflow-error-handler/SKILL.md)

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
├── README.md                    # このファイル
├── aws-investigation/           # AWS調査スキル
│   └── SKILL.md                 # スキル定義ファイル
├── backend-developer/           # Backend開発スキル
│   └── SKILL.md                 # スキル定義ファイル
├── cloudfront-error-handler/    # CloudFrontエラー対応スキル
│   └── SKILL.md                 # スキル定義ファイル
├── e2e-developer/               # E2E開発スキル
│   └── SKILL.md                 # スキル定義ファイル
├── file-refactor/               # ファイル/フォルダのリネーム・削除スキル
│   └── SKILL.md                 # スキル定義ファイル
├── frontend-developer/          # Frontend開発スキル
│   └── SKILL.md                 # スキル定義ファイル
├── infrastructure-developer/    # Infrastructure開発スキル
│   └── SKILL.md                 # スキル定義ファイル
├── rule-making/                 # ルール化スキル
│   └── SKILL.md                 # スキル定義ファイル
└── workflow-error-handler/      # ワークフローエラー対応スキル
    └── SKILL.md                 # スキル定義ファイル
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
- [Copilotインストラクション](../copilot-instructions.md)
