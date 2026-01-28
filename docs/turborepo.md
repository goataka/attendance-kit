# Turborepo設定ガイド

このドキュメントでは、プロジェクトで使用しているTurborepoの設定と最適化について説明します。

## 概要

Turborepoは、モノレポのビルドシステムを高速化するツールです。以下の機能により、開発効率を大幅に向上させます：

- **並列実行**: 複数のパッケージを同時にビルド
- **増分ビルド**: 変更されたファイルのみを再ビルド
- **インテリジェントキャッシング**: ビルド結果をキャッシュして再利用
- **タスク依存関係**: タスク間の依存関係を自動管理

## パフォーマンス結果

| シナリオ | ビルド時間 | 改善率 |
|---------|-----------|--------|
| 初回ビルド（キャッシュなし） | 6.2秒 | 20%改善 |
| 2回目以降（キャッシュあり） | 1.2秒 | **84%改善** |

元のnpm workspacesのみの構成: 7.7秒

## 設定ファイル

### package.json

プロジェクトルートの`package.json`で、Turborepoの使用に必要な設定を追加しています：

```json
{
  "packageManager": "npm@11.6.2",
  "scripts": {
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint"
  }
}
```

`packageManager`フィールドは、Turborepoがワークスペースを正しく認識するために必要です。このバージョンはNode.js 24.xに含まれるnpmのバージョンに対応しています。

### turbo.json

プロジェクトルートの`turbo.json`でTurborepoの動作を設定しています：

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "build/**", ".next/**", "!.next/cache/**"],
      "cache": true
    },
    "test": {
      "dependsOn": ["build"],
      "cache": true
    },
    "lint": {
      "cache": true,
      "outputs": []
    }
  }
}
```

Note: `.next/**`は将来Next.jsを使用する可能性を考慮して含まれています。

### 主な設定項目

#### dependsOn

タスク間の依存関係を定義します：

- `"^build"`: 依存パッケージのbuildタスクが先に実行される
- `"build"`: 同じパッケージ内のbuildタスクが先に実行される

#### outputs

タスクが生成するファイルのパターンを指定します：

- キャッシュに含めるべき出力ファイルを定義
- 例: `dist/**`, `build/**`

#### cache

タスクの結果をキャッシュするかどうかを指定します：

- `true`: キャッシュを有効化（推奨）
- `false`: 毎回実行（統合テストなど）

## 使用方法

### ローカル開発

```bash
# すべてのパッケージをビルド
npm run build

# すべてのパッケージをテスト
npm run test

# すべてのパッケージをLint
npm run lint
```

### キャッシュの確認

```bash
# キャッシュをクリアしてビルド
rm -rf .turbo && npm run build

# 2回目のビルド（キャッシュヒット）
npm run build
```

### タスクグラフの可視化

```bash
# ビルドの依存関係グラフを表示
npm run build -- --graph
```

## CI/CD での使用

### GitHub Actions

プロジェクトのGitHub Actionsワークフロー（`.github/workflows/premerge.yml`）では、Turborepoキャッシュを以下のように設定しています：

```yaml
- name: Setup Turborepo cache
  uses: actions/cache@v4
  with:
    path: .turbo
    key: ${{ runner.os }}-turbo-${{ hashFiles('**/package-lock.json') }}-${{ github.sha }}
    restore-keys: |
      ${{ runner.os }}-turbo-${{ hashFiles('**/package-lock.json') }}-
      ${{ runner.os }}-turbo-
```

#### キャッシュキーの戦略

- **プライマリキー**: `{OS}-turbo-{package-lock hash}-{commit SHA}`
  - 完全一致するキャッシュを優先的に使用
- **フォールバックキー1**: `{OS}-turbo-{package-lock hash}-`
  - 同じ依存関係を持つ他のコミットのキャッシュを使用
- **フォールバックキー2**: `{OS}-turbo-`
  - 最後の手段として、任意のTurborepoキャッシュを使用

この設定により、以下のシナリオでキャッシュが効果的に再利用されます：

1. **依存関係が変わらない場合**: 同じpackage-lock.jsonのハッシュを持つキャッシュを再利用
2. **ソースコードのみ変更**: Turborepoが変更されたパッケージのみを再ビルド
3. **依存関係が変更された場合**: 新しいキャッシュを作成

この設定により、CI/CD実行時にも以下の利点があります：

- 変更のないパッケージのビルドをスキップ
- 前回のビルド結果を再利用
- CI/CDの実行時間短縮

## パッケージ固有の設定

### websiteパッケージ

`@attendance-kit/website`は現在開発中で、ビルド出力がありません。そのため、`turbo.json`で以下のように設定しています：

```json
{
  "tasks": {
    "@attendance-kit/website#build": {
      "outputs": [],
      "cache": true
    }
  }
}
```

このような設定により、ビルドの成功/失敗ステータスがキャッシュされ、変更がない場合はビルドコマンドの実行自体がスキップされます。

## トラブルシューティング

### キャッシュがヒットしない

以下の原因が考えられます：

1. **ソースコードの変更**: 意図的な動作です
2. **node_modulesの変更**: 依存関係の更新後は再ビルドが必要
3. **環境変数の変更**: `globalDependencies`で指定されたファイルが変更された

### キャッシュをクリア

```bash
# ローカルキャッシュをクリア
rm -rf .turbo

# または特定のタスクのキャッシュのみクリア
npx turbo run build --force
```

## リモートキャッシング（将来の拡張）

現在はローカルキャッシュのみを使用していますが、将来的には以下のようなリモートキャッシングも検討できます：

- **Vercel Remote Cache**: Vercelが提供する無料のリモートキャッシュ
- **カスタムリモートキャッシュ**: S3などを使用した独自のキャッシュストレージ

チーム開発でリモートキャッシュを共有することで、さらなる効率化が可能です。

## 参考リンク

- [Turborepo公式ドキュメント](https://turbo.build/repo/docs)
- [タスク設定リファレンス](https://turbo.build/repo/docs/reference/configuration)
- [キャッシング戦略](https://turbo.build/repo/docs/core-concepts/caching)
