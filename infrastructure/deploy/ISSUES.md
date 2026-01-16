# Infrastructure Issues

このファイルには、インフラストラクチャに関する既知の課題と今後の改善項目を記録します。

## TODO

### DynamoDB Table Construct のリファクタリング

- [ ] `AttendanceKitStack`のコンストラクタ内のDynamoDBテーブル作成を別関数に切り出す
- [ ] `formatExportName()`を使用して重複処理を削減
- [ ] `addStandardTags()`を使用してタグ追加を簡潔化
- [ ] CDK Construct構造ルールに準拠（memory/documentation-rules.mdを参照）

**優先度**: Medium - コードの保守性向上のため、次の機能実装前に対応推奨

## 完了

なし
