# AWS CDK 統合テスト

## 目的

CDKコードが実際のAWS環境で正しく動作することを検証

## テスト内容

### cdklocalを使用したローカルでのリソース作成
- DynamoDB、S3、Lambda等のリソース作成成功を確認

### 循環参照や依存関係エラーの検知
- スタック間の依存関係が正しく解決されることを確認

### パラメータとシークレットの同期確認
- Systems ManagerパラメータストアやSecrets Managerとの連携

## 使用ツール

**Jest + cdklocal**
- LocalStackを利用したローカルAWS環境
- CDK Bootstrap、Synth、Deployの一連の流れを検証

## 実行タイミング

- プルリクエスト作成時（GitHub Actions）
- 定期的な統合テスト実行

## 接続先

LocalStack

## 実行方法

```bash
cd infrastructure
npm run test:integration
```
