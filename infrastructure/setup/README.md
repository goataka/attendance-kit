# 初回セットアップ

## ステップ1: OIDCプロバイダーとIAMロールの作成

CloudFormationを使用してOIDCプロバイダーとIAMロールを作成します。

1. AWSコンソールでCloudFormationサービスを開く
2. 新しいスタックを作成
3. `attendance-kit-setup.yaml`テンプレートをアップロード
4. パラメータを確認:
   - `GitHubOrg`: goataka
   - `GitHubRepo`: attendance-kit
5. スタックを作成
6. OutputsタブからロールARNをコピー

## ステップ2: リポジトリ同期の設定

CloudFormationスタックを自動更新するため、リポジトリ同期を設定します。

1. スタック詳細画面で「スタックアクション」→「リポジトリ同期を有効化」
2. 以下の設定を入力:
   - リポジトリ: `goataka/attendance-kit`
   - ブランチ: `main`
   - テンプレートパス: `infrastructure/setup/attendance-kit-setup.yaml`
3. 同期を有効化

## ステップ3: GitHub Secretsの設定

1. GitHubリポジトリのSettings > Secrets and variables > Actionsを開く
2. `AWS_ROLE_TO_ASSUME`に取得したロールARNを設定

## ステップ4: CDKデプロイ

1. GitHub Actionsタブを開く
2. "Deploy to AWS"ワークフローを実行

これでDynamoDBテーブルなどのインフラストラクチャがデプロイされます。
