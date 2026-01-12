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
├── .storybook/              # Storybook設定
├── workflows/               # フロントエンド専用ワークフロー
│   └── visual-snapshots.yml # ビジュアルスナップショット更新
├── scripts/                 # スクリプト
│   └── capture-screenshots.sh  # スクリーンショット自動生成
├── src/
│   ├── ClockInOutPage/      # 打刻画面（ページ単位）
│   │   ├── ClockInOutPage.tsx
│   │   ├── ClockInOutPage.css
│   │   ├── ClockInOutPage.test.tsx
│   │   ├── ClockInOutPage.e2e.spec.ts
│   │   ├── ClockInOutPage.stories.tsx
│   │   ├── ClockInOutPage.screenshot.png  # ビジュアルリグレッション
│   │   ├── ClockInOutPage.snapshot.html   # HTMLスナップショット
│   │   ├── README.md        # 画面仕様
│   │   └── TESTING.md       # テスト方針
│   ├── ClocksListPage/     # 打刻一覧画面（ページ単位）
│   │   ├── ClocksListPage.tsx
│   │   ├── ClocksListPage.css
│   │   ├── ClocksListPage.test.tsx
│   │   ├── ClocksListPage.e2e.spec.ts
│   │   ├── ClocksListPage.stories.tsx
│   │   ├── ClocksListPage.screenshot.png  # ビジュアルリグレッション
│   │   ├── ClocksListPage.snapshot.html   # HTMLスナップショット
│   │   ├── README.md        # 画面仕様
│   │   └── TESTING.md       # テスト方針
│   ├── shared/              # 共通リソース
│   │   ├── api/             # API関連
│   │   │   └── mockApi.ts
│   │   ├── types/           # 型定義
│   │   │   └── index.ts
│   │   ├── styles/          # グローバルスタイル
│   │   │   └── index.css
│   │   └── test/            # テスト共通設定
│   │       ├── setup.ts
│   │       └── App.snapshot.test.tsx
│   ├── App.tsx              # アプリケーションルート
│   └── main.tsx             # エントリーポイント
├── index.html               # HTMLテンプレート
├── vite.config.ts           # Vite設定
├── playwright.config.ts     # Playwright設定
├── tsconfig.json            # TypeScript設定
├── tsconfig.test.json       # テスト用TypeScript設定
├── tsconfig.storybook.json  # Storybook用TypeScript設定
└── package.json
```

### フォルダ構成の特徴

- **ページ単位の構成**: 各画面に関連するすべてのファイル（コンポーネント、スタイル、テスト、ストーリー、ドキュメント、スクリーンショット）を1つのフォルダにまとめています
- **shared フォルダ**: 複数画面で共有されるリソース（API、型定義、グローバルスタイル）を配置
- **ドキュメントの分離**: 各画面の仕様書とテスト方針を独立したファイルで管理
- **ビジュアルリグレッション**: 各ページのスクリーンショット（`.screenshot.png`）を自動生成・更新

## 画面一覧

- [打刻画面 (ClockInOutPage)](src/ClockInOutPage/README.md)
- [打刻一覧画面 (ClocksListPage)](src/ClocksListPage/README.md)

## ビルド・実行方法

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

## テスト実行

### 単体テスト

```bash
npm test                # 全テスト実行
```

**結果**: 13テスト全て合格

### E2Eテスト

```bash
npm run test:e2e        # E2Eテスト実行
```

**結果**: 8テスト（ビジュアルリグレッション含む）

### ビジュアルリグレッション（スクリーンショット）

```bash
npm run capture-screenshots  # スクリーンショット自動生成
```

各ページのスクリーンショットを自動的にキャプチャします：
- **保存場所**: 各ページフォルダ内（`{PageName}.screenshot.png`）
- **更新方式**: 変更がある場合のみ更新
- **自動化**: PRで自動実行され、変更があれば自動コミット

### Storybook

```bash
npm run storybook       # Storybook起動（http://localhost:6006）
```

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

## 共通リソース

### モックAPI

- **ファイル**: `src/shared/api/mockApi.ts`
- **テストアカウント**: user001/password123, user002/password456

### 型定義

- **ファイル**: `src/shared/types/index.ts`

### グローバルスタイル

- **ファイル**: `src/shared/styles/index.css`

## NestJSとの連携（将来対応）

現在はモックAPIを使用していますが、NestJSバックエンドが実装された際は以下の手順で連携します:

1. `src/shared/api/mockApi.ts` を実際のAPIクライアントに置き換え
2. 環境変数でAPIエンドポイントを設定
3. CORS設定を確認

## CDKデプロイ（未実装）

以下の機能が今後実装予定です:

- CloudFront + S3スタックの作成
- ビルド成果物の自動デプロイ
- カスタムドメインの設定
- CI/CDパイプラインの統合
