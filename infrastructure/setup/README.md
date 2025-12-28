# 初回セットアップ

## ステップ1: OIDCプロバイダーとIAMロールの作成

CloudFormationを使用してOIDCプロバイダーとIAMロールを作成します。

1. AWSコンソールでCloudFormationサービスを開く
2. 新しいスタックを作成
3. `attendance-kit-setup.yaml`テンプレートをアップロード
4. スタックを作成
5. OutputsタブからロールARNをコピー

## ステップ2: GitHub Secretsの設定

1. GitHubリポジトリのSettings > Secrets and variables > Actionsを開く
2. `AWS_ROLE_TO_ASSUME`に取得したロールARNを設定

## ステップ3: CDKデプロイ

1. GitHub Actionsタブを開く
2. "Deploy to AWS"ワークフローを実行

これでDynamoDBテーブルなどのインフラストラクチャがデプロイされます。

## テンプレートの更新

`attendance-kit-setup.yaml`を変更した場合は、AWSコンソールでCloudFormationスタックを手動更新してください。

1. CloudFormationコンソールでスタックを選択
2. 「スタックアクション」→「スタックを更新」
3. 「既存テンプレートを置き換える」を選択
4. 更新された`attendance-kit-setup.yaml`をアップロード
5. 変更セットを確認して実行
