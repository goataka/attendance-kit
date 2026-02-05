# TurboRepo

## 概要

このプロジェクトではビルドパイプラインの高速化のために [TurboRepo](https://turbo.build/repo) を導入しています。

TurboRepoは以下の機能を提供します:

- **インクリメンタルビルド**: 変更されたパッケージのみをビルド
- **並列実行**: 複数のタスクを並列で実行
- **インテリジェントキャッシング**: 以前のビルド結果を再利用

## 設定ファイル

### turbo.json

プロジェクトルートの `turbo.json` でタスクの依存関係とキャッシュ設定を定義しています。

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "build/**", ".next/**", "storybook-static/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "cache": false
    },
    "test:unit": {
      "dependsOn": ["build"],
      "cache": false
    },
    "lint": {
      "cache": true
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### 主要な設定

- **build**: 依存パッケージのビルド完了後に実行。出力ファイルをキャッシュ
- **test/test:unit**: ビルド完了後に実行。キャッシュは無効（常に実行）
- **lint**: キャッシュを有効化（変更がない場合はスキップ）
- **dev**: 開発サーバーとして起動。キャッシュ無効、永続プロセス

## コマンド

### TurboRepo経由での実行

```bash
# すべてのパッケージでビルド
npm run build

# すべてのパッケージでテスト
npm run test

# すべてのパッケージでLint
npm run lint
```

### レガシーコマンド（npm workspaces）

後方互換性のため、npm workspacesを直接使用するコマンドも残されています:

```bash
npm run build:legacy
npm run test:legacy
npm run lint:legacy
```

## キャッシュ

### ローカルキャッシュ

TurboRepoは `.turbo/` ディレクトリにキャッシュを保存します。このディレクトリは `.gitignore` に追加されています。

### キャッシュのクリア

```bash
# キャッシュディレクトリを削除
rm -rf .turbo/
```

## パフォーマンス効果

初回実行とキャッシュヒット時の実行時間の比較例:

| タスク | 初回実行 | キャッシュヒット |
|--------|----------|------------------|
| build  | 6.7秒    | 69ms            |
| lint   | 3.8秒    | 63ms            |

キャッシュが有効な場合、「FULL TURBO」と表示され、すべてのタスクがキャッシュから取得されます。

## トラブルシューティング

### キャッシュが無効になる場合

以下の場合、キャッシュは無効になります:

- ソースファイルが変更された
- `package.json` または `package-lock.json` が変更された
- 環境変数が変更された
- `turbo.json` の設定が変更された

### エラーが発生した場合

1. キャッシュをクリアして再実行
2. `npm run build:legacy` でnpm workspaces経由で実行して問題を切り分け
3. 個別のパッケージでコマンドを実行して問題を特定

## 参考

- [TurboRepo公式ドキュメント](https://turbo.build/repo/docs)
- [TurboRepo Configuration](https://turbo.build/repo/docs/reference/configuration)
