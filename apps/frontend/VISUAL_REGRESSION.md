# ビジュアルリグレッションテスト

## 概要

各ページのスクリーンショットを自動的にキャプチャし、ビジュアルリグレッションテストを実行するシステムです。

## 仕組み

### スクリーンショット保存場所

各ページのフォルダ内にスクリーンショットが保存されます：

```
src/
├── ClockInOutPage/
│   ├── ClockInOutPage.tsx
│   ├── ClockInOutPage.screenshot.png  ← スクリーンショット
│   └── ...
└── ClocksListPage/
    ├── ClocksListPage.tsx
    ├── ClocksListPage.screenshot.png  ← スクリーンショット
    └── ...
```

### 実行方法

#### 手動実行

```bash
# 1. 開発サーバーを起動
npm run dev

# 2. 別のターミナルでスクリーンショットをキャプチャ
npm run capture-screenshots
```

#### シェルスクリプト直接実行

```bash
cd apps/frontend
./scripts/capture-screenshots.sh
```

### 動作

1. **開発サーバーの確認**: `http://localhost:5173` が起動しているか確認
2. **Playwrightブラウザのインストール**: 必要に応じて自動インストール
3. **各ページのキャプチャ**:
   - 各ページにアクセス
   - ページが完全に読み込まれるまで待機
   - フルページスクリーンショットを撮影
4. **変更検出**:
   - 既存のスクリーンショットとSHA256ハッシュで比較
   - 変更がある場合のみファイルを更新
5. **サマリー表示**:
   - 更新されたファイル数
   - 変更がなかったファイル数

## 自動化（GitHub Actions）

### トリガー

Pull Requestで以下のファイルが変更された場合に自動実行：
- `apps/frontend/src/**/*.tsx`
- `apps/frontend/src/**/*.css`
- `apps/frontend/src/**/*.ts`

（テストファイルは除外）

### ワークフロー

1. **環境セットアップ**: Node.js、依存関係、Playwrightをインストール
2. **開発サーバー起動**: バックグラウンドで起動し、準備完了を待機
3. **スクリーンショットキャプチャ**: スクリプトを実行
4. **変更検出**: gitで差分を確認
5. **自動コミット**: 変更があれば自動的にコミット＆プッシュ
6. **PRコメント**: 更新があったことをPRにコメント

### ワークフローファイル

`.github/workflows/pr.yml`

## トラブルシューティング

### 開発サーバーが起動していない

```
⚠️  Dev server not running. Please start it with 'npm run dev' first.
```

**解決方法**: 別のターミナルで `npm run dev` を実行してください。

### Playwrightブラウザがインストールされていない

スクリプトが自動的にインストールを試みます。手動でインストールする場合：

```bash
npx playwright install chromium --with-deps
```

### スクリーンショットが更新されない

変更がない場合は更新されません。これは正常な動作です。
強制的に再キャプチャしたい場合は、既存のスクリーンショットを削除してから実行してください：

```bash
rm src/*//*.screenshot.png
npm run capture-screenshots
```

## スクリーンショット仕様

- **画像形式**: PNG
- **ビューポートサイズ**: 1280x720
- **キャプチャモード**: フルページ
- **待機条件**: 
  - ネットワークアイドル状態
  - 主要要素の表示確認
  - 500msの追加待機（アニメーション対応）

## ベストプラクティス

1. **PR作成前に実行**: ローカルでスクリーンショットを確認
2. **意図的な変更の確認**: UI変更時はスクリーンショットの差分を確認
3. **コミットに含める**: スクリーンショットの変更もコミットに含める
4. **レビュー時の確認**: PRレビュー時にスクリーンショットの差分を確認

## 新しいページの追加

新しいページを追加した場合、`scripts/capture-screenshots.sh` を更新してください：

```bash
PAGES=(
  "ClockInOutPage"
  "ClocksListPage"
  "NewPage"  # ← 追加
)
```

また、スクリプト内の `pages` 配列にも設定を追加：

```javascript
{
  name: 'NewPage',
  url: '/new-page',
  dir: 'src/NewPage',
  waitFor: '.main-element',  // 待機する要素のセレクター
}
```
