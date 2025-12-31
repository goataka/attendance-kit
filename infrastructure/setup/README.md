# 初回セットアップ

## ステップ1: OIDCプロバイダーとIAMロールの作成

CloudFormationを使用してOIDCプロバイダーとIAMロールを作成します。

1. AWSコンソールでCloudFormationサービスを開く
2. 新しいスタックを作成
3. `attendance-kit-setup.yaml`テンプレートをアップロード
4. スタック名: `AttendanceKit-Setup-Stack`
5. スタックを作成
6. OutputsタブからロールARNをコピー

## ステップ2: GitHub Secretsの設定

GitHubリポジトリのSettings > Secrets and variables > Actionsを開く

### 必須シークレット
- `AWS_ROLE_TO_ASSUME`: 取得したロールARN

### コストアラート用シークレット（推奨）
- `COST_ALERT_EMAIL`: コストアラート送信先のメールアドレス

例: `your-email@example.com`

## ステップ3: CDKデプロイ

### 環境スタックのデプロイ

1. GitHub Actionsタブを開く
2. "Deploy to AWS"ワークフローを実行

これでDynamoDBテーブルなどのインフラストラクチャがデプロイされます。

### アカウントスタックのデプロイ（コストアラート）

コストアラート機能を有効にする場合:

```bash
# ローカル環境から実行
cd infrastructure/deploy
COST_ALERT_EMAIL=your-email@example.com npm run cdk deploy AttendanceKit-Account-Stack
```

または GitHub Actions経由でデプロイする場合は、ワークフローファイルを更新してください。

## ステップ4: SNSサブスクリプション確認（コストアラート）

コストアラート機能をデプロイした場合:

1. 登録したメールアドレスに「AWS Notification - Subscription Confirmation」メールが届く
2. メール内の「Confirm subscription」リンクをクリック
3. ブラウザで確認ページが表示されれば完了

これでコストアラート通知を受信できるようになります。

## テンプレートの更新

`attendance-kit-setup.yaml`を変更した場合は、AWSコンソールでCloudFormationスタックを手動更新してください。

1. CloudFormationコンソールで `AttendanceKit-Setup-Stack` を選択
2. 「スタックアクション」→「スタックを更新」
3. 「既存テンプレートを置き換える」を選択
4. 更新された`attendance-kit-setup.yaml`をアップロード
5. 変更セットを確認して実行

## トラブルシューティング

### コストアラートが届かない場合

**確認項目**:
- SNSサブスクリプションが「Confirmed」状態か確認
- `COST_ALERT_EMAIL`が正しく設定されているか確認
- AWS Budgetコンソールで予算設定を確認

**対処方法**:
1. SNSコンソールでトピック「attendance-kit-cost-alerts」を開く
2. サブスクリプションの状態を確認
3. 未確認の場合は「サブスクリプションのリクエスト」を再送信

### スタックデプロイエラー

**エラー**: `COST_ALERT_EMAIL environment variable must be set`

**対処方法**:
```bash
# 環境変数を設定してデプロイ
COST_ALERT_EMAIL=your-email@example.com npm run cdk deploy AttendanceKit-Account-Stack
```

または GitHub Secrets に `COST_ALERT_EMAIL` を追加してください。
