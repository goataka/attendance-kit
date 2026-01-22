# Infrastructure Issues

インフラストラクチャの課題詳細を管理します。

## 課題一覧

### プロジェクト構造

#### 候補

- [ ] infrastructureをなくす
  - 現在の`infrastructure/`ディレクトリの再構成を検討
  - CDKスタックの配置場所の見直し
  - モノレポ構成における最適な構造の検討

### DynamoDB Table Construct のリファクタリング

- [ ] `AttendanceKitStack`のコンストラクタ内のDynamoDBテーブル作成を別関数に切り出す
- [ ] `formatExportName()`を使用して重複処理を削減
- [ ] `addStandardTags()`を使用してタグ追加を簡潔化
- [ ] CDK Construct構造ルールに準拠（memory/documentation-rules.mdを参照）

**優先度**: Medium - コードの保守性向上のため、次の機能実装前に対応推奨

## 関連リンク

- [課題ファイルの作成方法](../../issues/GUIDE.md)
