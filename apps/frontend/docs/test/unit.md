# React ユニットテスト

## 目的

UI非依存のロジックとカスタムフックの動作検証

## テスト内容

### Custom Hooksの戻り値
- useAttendance、useAuthなどのカスタムフック
- 状態管理とライフサイクルの検証

### 純粋な関数（Utils）の出力
- 日付フォーマット関数
- バリデーション関数
- 計算ロジック

### UI非依存のステート管理ロジック
- Redux/Zustandストアのreducers/actions
- ビジネスロジックの分離

## 使用ツール

**Jest**
- @testing-library/react-hooksを使用
- 純粋関数のテスト

## 実行タイミング

- 開発中（ファイル保存時）
- プルリクエスト作成時

## 接続先

なし（Mockを使用）

## 実行方法

```bash
cd apps/frontend
npm test
```

## テストカバレッジ目標

70%以上

