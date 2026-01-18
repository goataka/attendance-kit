# AWS利用金額アラート 実装サマリー

**実装日**: 2025-12-31  
**ステータス**: 完了

## 概要

AWS Budgetを使用した利用金額アラート機能を実装しました。月次予算1000円を設定し、実際の利用額と予測額が予算を超えた場合にSNS経由でスマホアプリに通知する仕組みを構築しました。

## 実装内容

### AWS Budget設定

**予算設定**:
- 予算名: `attendance-kit-monthly-budget`
- 予算額: 1000円/月
- 予算期間: 月次（MONTHLY）
- スコープ: AWSアカウント全体

**アラート設定**:
1. **実利用額アラート**
   - 閾値: 100%（1000円）
   - トリガー: 実際の利用額が予算を超えた時
   - 通知先: SNSトピック

2. **予測額アラート**
   - 閾値: 100%（1000円）
   - トリガー: 月末までの予測額が予算を超える見込みの時
   - 通知先: SNSトピック

### SNS通知

**SNSトピック**:
- トピック名: `attendance-kit-cost-alerts`
- 用途: AWS Budgetからのアラート通知配信
- サブスクリプション: スマホアプリへの配信設定（Email/SMS/モバイルプッシュ等）

**通知内容**:
- 利用額または予測額
- 予算額
- アカウント情報
- アラートタイプ（実利用額/予測額）

### インフラストラクチャコード

**AWS CDK実装**:
- `lib/attendance-kit-account-stack.ts`: アカウントレベルスタック
- `lib/constructs/cost-budget.ts`: Budget構成（Construct）
- テスト: ユニットテストでBudget設定検証

**CloudFormation管理**:
- AWS Budgetリソース
- SNSトピックとポリシー
- サブスクリプション設定

### CI/CD

**デプロイワークフロー**:
- ワークフロー: `.github/workflows/deploy-account-stack.yml`
- トリガー:
  - 自動: `main`ブランチへのpush（Account Stack関連ファイル変更時）
  - 手動: workflow_dispatch
- 環境: production（アカウント単位）
- 必須シークレット: `COST_ALERT_EMAIL` (通知先メールアドレス)

### テスト

**ユニットテスト**:
- Budget作成検証
- 予算額検証
- アラート設定検証（実利用額/予測額）
- SNSトピック作成検証
- 閾値検証

## 技術スタック

- **コスト管理**: AWS Budget
- **通知**: Amazon SNS
- **IaC**: AWS CDK (TypeScript)
- **CI/CD**: GitHub Actions
- **テスト**: Jest

## アラートシナリオ

### シナリオ1: 実利用額超過
- AWS利用額が1000円を超える
- SNSトピックにメッセージ送信
- スマホアプリに通知

### シナリオ2: 予測額超過
- 月末までの予測利用額が1000円を超える見込み
- SNSトピックにメッセージ送信
- スマホアプリに通知

### シナリオ3: 予算内
- 実利用額・予測額ともに予算内
- 通知なし

## セキュリティ

- SNSトピックアクセス権限の適切な設定
- AWS Budgetからの送信許可
- シークレット管理（GitHub Secrets）

## コスト最適化

- AWS Budgetは追加コスト不要（最初の2つの予算は無料）
- CloudWatchアラーム未使用（コスト削減）
- SNSは低コスト（通知数に応じた従量課金）

## 制限事項

- 予算はアカウント全体（環境別の詳細はCost Explorerで確認）
- 月次予算のみ（日次・週次は未対応）
- 通知の重複可能性（実利用額と予測額の両方が同時にトリガー）

## 今後の拡張

- タグベースのコスト配分
- 環境別予算設定
- 複数の閾値設定（80%, 100%等）
- コストレポートの自動生成

## 関連リソース

- [インフラストラクチャREADME](../../infrastructure/README.md)
- [デプロイ手順](../../infrastructure/DEPLOYMENT.md)
- [AWS Budgetドキュメント](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html)
