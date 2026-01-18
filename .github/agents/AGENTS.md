# Agent開発ガイドライン

最終更新: 2026-01-18

## このプロジェクトでのエージェントの役割

GitHub Copilot Coding Agentは、このプロジェクトにおいて**自律的な開発パートナー**として機能します。エージェントは以下の原則に基づいて行動します。

### MVP原則

**最小実装を優先し、段階的に機能を拡張する**

- 完璧を目指すより、動作する最小限の実装を優先
- 必要な機能のみを実装し、過剰な設計を避ける
- フィードバックを受けて反復的に改善

### 理解容易性の優先

**コードとドキュメントは誰にでも理解できるシンプルさを保つ**

- 複雑な抽象化よりも明確な実装を選択
- コメントや説明は必要最小限に、コード自体が意図を表現
- 一貫した命名規則とパターンを使用

### 自己検証性の確保

**変更後は必ず動作確認とテストを実施**

- コード変更後は必ずビルドとテストを実行
- エラーや警告は即座に修正
- 手動での動作確認も適宜実施

## プロジェクトサマリ

### プロジェクト概要

**勤怠管理システム (Attendance Kit)**

GitHub Copilot Agentのみで構築する、モダンなクラウドベースの勤怠管理システム。

### 技術スタック

- **フロントエンド**: 未実装（将来的にReact/Next.js等を検討）
- **バックエンド**: 未実装（将来的にNode.js/TypeScript等を検討）
- **インフラストラクチャ**: AWS CDK (TypeScript)
- **データベース**: Amazon DynamoDB
- **CI/CD**: GitHub Actions
- **認証**: AWS OIDC (GitHub Actions用)

### プロジェクト構造

```
.
├── .devcontainer/          # DevContainer設定 (Node.js 24)
├── .github/
│   ├── agents/            # エージェント開発ガイドライン（このファイル）
│   ├── skills/            # GitHub Copilot Agent Skills定義
│   └── workflows/         # CI/CDワークフロー
├── apps/                  # アプリケーション（npmワークスペース）
│   ├── frontend/          # フロントエンドアプリケーション（未実装）
│   ├── backend/           # バックエンドアプリケーション（未実装）
│   └── website/           # Webサイト（未実装）
├── infrastructure/        # インフラストラクチャコード
│   ├── deploy/           # CDKプロジェクト
│   │   ├── lib/          # CDKスタック定義
│   │   └── test/         # インフラテスト
│   ├── setup/            # 初回セットアップ用CloudFormation
│   └── issues/           # 実装記録
├── docs/                 # ドキュメント
└── scripts/              # 開発・CI/CD支援スクリプト
```

### 現在の実装状況

**完了**:
- DynamoDB Clock Tableのデプロイ（CDK）
- AWS Cost/Usage Alerts（AWS Budget）
- OIDC認証によるGitHub Actions → AWS接続
- DevContainer環境構築

**未実装**:
- フロントエンドアプリケーション
- バックエンドAPI
- 認証・認可機能
- 実際の勤怠記録機能

### 開発フロー

1. **Issue/要件の確認**: 実装する機能を明確化
2. **設計**: 必要に応じてドキュメントを作成
3. **実装**: MVP原則に基づき最小限の実装
4. **テスト**: 自己検証（ビルド、ユニットテスト、手動確認）
5. **レビュー**: `code_review`ツールでレビュー依頼
6. **セキュリティチェック**: `codeql_checker`でスキャン
7. **PR作成**: 変更内容をまとめてPR

### 言語ポリシー

**日本語を使用**:
- PRのタイトル・説明
- コミットメッセージ
- Issue、レビューコメント
- ドキュメント（README、仕様書等）
- コードのコメント

**英語を使用**:
- コード（変数名、関数名、クラス名）
- 技術用語（固有名詞）

詳細は [copilot-instructions.md](../copilot-instructions.md) を参照。

### 重要なドキュメント

- [Copilotインストラクション](../copilot-instructions.md): Copilot Agentの動作指示
- [インフラストラクチャREADME](../../infrastructure/README.md): AWSリソースの概要
- [デプロイ手順](../../infrastructure/DEPLOYMENT.md): デプロイワークフローの使い方
- [セットアップガイド](../../infrastructure/setup/README.md): 初回セットアップ手順

## 開発時の注意事項

### セキュリティ

- IAM権限は特定のリソースパターンにスコープ
- ワイルドカード(`*`)の使用を避ける
- シークレットはGitHub Secretsで管理

### コスト最適化

- CloudWatchアラームなど、コストがかかる監視機能は初期段階では実装しない
- DynamoDBはOn-Demand課金モデルを使用
- 無料枠の範囲で利用できる基本的なメトリクスのみを使用

### コーディング規約

- TypeScript: strict モード有効
- ESLint/Prettierの設定に従う
- テストカバレッジ: 重要なロジックは必ずテスト

## 参考資料

- [GitHub Copilot Coding Agent Documentation](https://gh.io/copilot-coding-agent-docs)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
