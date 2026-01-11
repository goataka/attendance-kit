# フロントエンド実装ドキュメント

## 概要

勤怠管理システムのフロントエンドをReact + Viteで実装しました。SSRは不要でCSRのみの実装となっています。

## 技術スタック

- **フレームワーク**: React 18.3.1
- **ビルドツール**: Vite 6.0.3
- **言語**: TypeScript 5.7.2
- **ルーティング**: React Router 6.26.2
- **テスト**: Vitest 2.1.8 + React Testing Library 16.1.0
- **E2Eテスト**: Playwright 1.48.0
- **ストーリーブック**: Storybook 8.4.7
- **Lint**: ESLint 9.15.0

## プロジェクト構造

```
apps/frontend/
├── .storybook/           # Storybook設定
├── e2e/                  # Playwrightテスト
│   ├── clock-in-out.spec.ts
│   └── records-list.spec.ts
├── src/
│   ├── api/              # モックAPI
│   │   └── mockApi.ts
│   ├── pages/            # ページコンポーネント
│   │   ├── ClockInOutPage.tsx
│   │   └── RecordsListPage.tsx
│   ├── stories/          # Storybookストーリー
│   │   ├── ClockInOutPage.stories.tsx
│   │   └── RecordsListPage.stories.tsx
│   ├── styles/           # CSSスタイル
│   │   ├── index.css
│   │   ├── ClockInOutPage.css
│   │   └── RecordsListPage.css
│   ├── test/             # 単体テスト
│   │   ├── setup.ts
│   │   ├── App.snapshot.test.tsx
│   │   ├── ClockInOutPage.test.tsx
│   │   └── RecordsListPage.test.tsx
│   ├── types/            # 型定義
│   │   └── index.ts
│   ├── App.tsx           # アプリケーションルート
│   └── main.tsx          # エントリーポイント
├── index.html            # HTMLテンプレート
├── vite.config.ts        # Vite設定
├── playwright.config.ts  # Playwright設定
└── package.json
```

## 実装機能

### 1. 打刻画面（/）

**機能**:
- ユーザーID入力
- パスワード入力
- 出勤ボタン
- 退勤ボタン
- 打刻一覧へのリンク
- テストアカウント情報の表示

**テストアカウント**:
- user001 / password123
- user002 / password456

**バリデーション**:
- 未入力チェック
- 認証エラー表示
- 成功メッセージ表示

### 2. 打刻一覧画面（/records）

**機能**:
- 打刻データの一覧表示
- ユーザーIDによる検索
- 日時範囲による検索
- 打刻種別（出勤/退勤）による検索
- フィルタのリセット
- 打刻画面へのリンク

**表示項目**:
- ID
- ユーザーID
- 日時
- 種別（出勤/退勤）

### 3. モックAPI

**エンドポイント**:
- `clockInOut(request)`: 打刻実行
- `getRecords(filter)`: 打刻一覧取得（フィルタリング対応）

**モックデータ**:
- 初期データとして4件の打刻レコードを用意
- 新規打刻はメモリ上に追加

## テスト

### 単体テスト（Vitest）

**実行方法**:
```bash
npm test
```

**テスト内容**:
- App.snapshot.test.tsx: アプリケーション全体のスナップショットテスト
- ClockInOutPage.test.tsx: 打刻画面の単体テスト（5テスト）
  - レンダリングテスト
  - 未入力エラーテスト
  - 成功時の動作テスト
  - 失敗時の動作テスト
  - パスワードクリアテスト
- RecordsListPage.test.tsx: 打刻一覧画面の単体テスト（7テスト）
  - レンダリングテスト
  - ローディング状態テスト
  - データ表示テスト
  - フィルタリングテスト（ユーザーID、種別）
  - リセットテスト
  - データなし表示テスト

**結果**: 13テスト全て合格

### E2Eテスト（Playwright）

**実行方法**:
```bash
npm run test:e2e
```

**テスト内容**:
- clock-in-out.spec.ts: 打刻画面のE2Eテスト（4テスト）
  - フォーム表示確認
  - 打刻成功フロー
  - エラーハンドリング
  - ナビゲーション
  - ビジュアルリグレッションテスト
- records-list.spec.ts: 打刻一覧画面のE2Eテスト（4テスト）
  - 一覧表示確認
  - フィルタリング動作
  - リセット動作
  - ナビゲーション
  - ビジュアルリグレッションテスト

**ビジュアルリグレッション**:
- 各画面のスクリーンショットを自動比較
- UIの意図しない変更を検出

### Storybook

**実行方法**:
```bash
npm run storybook
```

**ストーリー**:
- ClockInOutPage: 打刻画面のストーリー
- RecordsListPage: 打刻一覧画面のストーリー

**用途**:
- コンポーネントのビジュアル確認
- デザインレビュー
- コンポーネントドキュメント

## ビルド

### 開発サーバー

```bash
npm run dev
```

起動後、http://localhost:5173 でアクセス可能

### プロダクションビルド

```bash
npm run build
```

ビルド成果物は `dist/` ディレクトリに出力されます。

## Lint

```bash
npm run lint
```

ESLintによるコード品質チェックを実行します。

## プレマージチェック

プルリクエスト作成前に以下を実行してください:

```bash
npm run lint
npm test
npm run build
```

すべて成功すればマージ可能な状態です。

## NestJSとの連携（将来対応）

現在はモックAPIを使用していますが、NestJSバックエンドが実装された際は以下の手順で連携します:

1. `src/api/mockApi.ts` を実際のAPIクライアントに置き換え
2. 環境変数でAPIエンドポイントを設定
3. CORS設定を確認

## CDKデプロイ（未実装）

以下の機能が今後実装予定です:

- CloudFront + S3スタックの作成
- ビルド成果物の自動デプロイ
- カスタムドメインの設定
- CI/CDパイプラインの統合

## トラブルシューティング

### ビルドエラー

```bash
rm -rf node_modules dist
npm install
npm run build
```

### テスト失敗

```bash
# スナップショット更新
npm test -- -u

# E2Eテストのスクリーンショット更新
npm run test:visual
```

## MVP機能チェックリスト

- [x] 出勤・退勤打刻機能
- [x] ユーザー認証（モック）
- [x] 打刻一覧表示
- [x] フィルタリング機能
- [x] ページ間ナビゲーション
- [x] レスポンシブデザイン
- [x] 単体テスト
- [x] E2Eテスト
- [x] Storybook
- [ ] CDKデプロイ
