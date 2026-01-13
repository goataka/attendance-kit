# Capture Snapshots Composite Action

## 概要

このComposite Actionは、フロントエンドのビジュアルリグレッションテストのためのスナップショット（スクリーンショット）を自動的に生成・更新するためのものです。

## 目的

- フロントエンドコンポーネントの変更時に、自動的にスクリーンショットを生成
- 変更があった場合のみスナップショットを更新（SHA256ハッシュで検証）
- 変更内容をPRに自動コミット
- ビジュアルリグレッションテストの基盤を提供

## 使用方法

このComposite Actionは、`.github/workflows/frontend-pr.yml`から呼び出されます。

### 呼び出し例

```yaml
update-frontend-snapshots:
  needs: check-paths
  if: needs.check-paths.outputs.frontend == 'true'
  runs-on: ubuntu-latest
  permissions:
    contents: write
    pull-requests: write
  steps:
    - uses: ./apps/frontend/workflows/capture-snapshots
```

### 前提条件

- フロントエンド開発サーバーが正常に起動すること
- Playwrightがインストールされていること
- Node.js環境が利用可能であること

## 動作フロー

1. **リポジトリのチェックアウト**: PRのHEADをチェックアウト
2. **Node.js環境のセットアップ**: Node.js 20をインストール
3. **依存関係のインストール**: `npm ci`で依存関係をインストール
4. **Playwrightブラウザのインストール**: Chromiumブラウザをインストール
5. **開発サーバーの起動**: バックグラウンドでVite開発サーバーを起動
6. **スクリーンショットの生成**: `scripts/capture-screenshots.sh`を実行
7. **変更の検出とコミット**: 変更があれば自動的にコミット＆プッシュ

## 生成されるスナップショット

各ページフォルダに以下のファイルが生成されます：

- `ClockInOutPage/ClockInOutPage.screenshot.png`: 打刻画面のスクリーンショット
- `ClocksListPage/ClocksListPage.screenshot.png`: 打刻一覧画面のスクリーンショット

## スナップショット更新のロジック

スクリプト（`scripts/capture-screenshots.sh`）は、以下のロジックでスナップショットを更新します：

1. 各ページを開いてスクリーンショットを撮影
2. 既存のスクリーンショットとSHA256ハッシュで比較
3. ハッシュが異なる場合のみファイルを更新
4. 変更があったページ数をカウント

## トラブルシューティング

### 開発サーバーが起動しない

- `npm run dev`が正常に動作するか確認
- ポート5173が利用可能か確認
- package.jsonの`dev`スクリプトを確認

### スクリーンショットが生成されない

- Playwrightが正しくインストールされているか確認
- ブラウザ（Chromium）が正しくインストールされているか確認
- スクリプトに実行権限があるか確認

### 変更が自動コミットされない

- GitHub Actionsの`permissions.contents: write`が設定されているか確認
- ブランチに対してプッシュ権限があるか確認

## メンテナンス

### スクリーンショット対象ページの追加

新しいページを追加する場合は、`scripts/capture-screenshots.sh`を更新してください。スクリプトには、撮影対象のページ情報（ページ名、URL、保存先パス）を追加します。

### スクリーンショット解像度の変更

デフォルトの解像度は1280x720pxです。変更する場合は、スクリプト内の`viewport`設定を調整してください。

## 関連ファイル

- `action.yml`: このComposite Actionの定義ファイル
- `../../scripts/capture-screenshots.sh`: スクリーンショット生成スクリプト
- `../../../.github/workflows/frontend-pr.yml`: このアクションを呼び出すワークフロー
- `../../VISUAL_REGRESSION.md`: ビジュアルリグレッションテストの詳細ドキュメント

## 注意事項

- このアクションはPR作成時およびフロントエンドファイル変更時にのみ実行されます
- スクリーンショット生成には約30秒～1分程度かかります
- 生成されたスクリーンショットはGitで管理されるため、バイナリファイルがリポジトリに追加されます
