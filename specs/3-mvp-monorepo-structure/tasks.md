# 実装タスク: MVP モノレポ構成

## タスク一覧

### セットアップタスク

#### タスク: ルートpackage.jsonの作成

**内容**:
- npm workspaces設定
- ビルドスクリプト定義
- 共通依存関係の定義

**成果物**:
- `package.json`（ルート）

**受け入れ基準**:
- workspacesが正しく設定されている
- `npm install`が正常に実行できる

---

#### タスク: TypeScript基本設定の作成

**内容**:
- ベースtsconfig.jsonの作成
- 各パッケージで継承可能な設定

**成果物**:
- `tsconfig.json`（ルート）

**受け入れ基準**:
- TypeScriptコンパイラが正常に動作する
- 型チェックが機能する

---

#### タスク: .gitignoreの更新

**内容**:
- Node.js関連の除外設定追加
- ビルド成果物の除外設定追加

**成果物**:
- `.gitignore`（更新）

**受け入れ基準**:
- node_modules、dist、.viteが除外される

---

### 共通パッケージタスク

#### タスク: packages/typesの作成

**内容**:
- 共通型定義パッケージの作成
- ClockRecord、User、ApiResponse等の型定義
- エクスポート設定

**成果物**:
- `packages/types/package.json`
- `packages/types/tsconfig.json`
- `packages/types/src/index.ts`
- `packages/types/src/clock.ts`
- `packages/types/src/api.ts`

**受け入れ基準**:
- 他のパッケージから型をインポート可能
- TypeScriptビルドが成功する

---

#### タスク: packages/configの作成

**内容**:
- 共通設定パッケージの作成
- ベースVite設定
- ベースTypeScript設定のエクスポート

**成果物**:
- `packages/config/package.json`
- `packages/config/tsconfig.json`
- `packages/config/vite.config.base.ts`

**受け入れ基準**:
- 他のパッケージから設定をインポート可能
- Vite設定が正常に動作する

---

### フロントエンドタスク

#### タスク: frontendの基本セットアップ

**内容**:
- Reactプロジェクトのセットアップ
- Vite設定
- TypeScript設定
- 依存パッケージのインストール

**成果物**:
- `apps/frontend/package.json`
- `apps/frontend/tsconfig.json`
- `apps/frontend/vite.config.ts`
- `apps/frontend/index.html`

**受け入れ基準**:
- `npm run dev -w apps/frontend`が起動する
- http://localhost:5173でアプリが表示される

---

#### タスク: フロントエンドの基本コンポーネント作成

**内容**:
- App.tsxの作成
- main.tsxの作成
- グローバルスタイル設定（プライマリカラー: #007CC0）
- レスポンシブデザインの基本CSS

**成果物**:
- `apps/frontend/src/main.tsx`
- `apps/frontend/src/App.tsx`
- `apps/frontend/src/index.css`

**受け入れ基準**:
- アプリが表示される
- プライマリカラーが適用されている
- レスポンシブデザインが機能する

---

#### タスク: 打刻コンポーネントの作成

**内容**:
- ClockInButtonコンポーネント
- ClockOutButtonコンポーネント
- ユーザー入力フォーム
- 打刻履歴表示コンポーネント

**成果物**:
- `apps/frontend/src/components/ClockInButton.tsx`
- `apps/frontend/src/components/ClockOutButton.tsx`
- `apps/frontend/src/components/UserInput.tsx`
- `apps/frontend/src/components/RecordList.tsx`

**受け入れ基準**:
- ボタンがクリック可能
- ユーザー入力が可能
- UIが適切に表示される

---

#### タスク: フロントエンドAPIサービスの作成

**内容**:
- API通信サービスの実装
- 型定義パッケージの利用
- エラーハンドリング

**成果物**:
- `apps/frontend/src/services/api.ts`

**受け入れ基準**:
- 共通型定義を使用している
- API呼び出しロジックが実装されている

---

### バックエンドタスク

#### タスク: backendの基本セットアップ

**内容**:
- NestJSプロジェクトのセットアップ
- TypeScript設定
- 依存パッケージのインストール

**成果物**:
- `apps/backend/package.json`
- `apps/backend/tsconfig.json`
- `apps/backend/nest-cli.json`

**受け入れ基準**:
- `npm run dev -w apps/backend`が起動する
- http://localhost:3000でAPIが応答する

---

#### タスク: バックエンドの基本構造作成

**内容**:
- main.tsの作成
- app.moduleの作成
- CORS設定

**成果物**:
- `apps/backend/src/main.ts`
- `apps/backend/src/app.module.ts`

**受け入れ基準**:
- サーバーが起動する
- CORS設定が有効

---

#### タスク: 打刻APIの実装

**内容**:
- ClockControllerの作成
- ClockServiceの作成
- ClockModuleの作成
- 型定義パッケージの利用

**成果物**:
- `apps/backend/src/clock/clock.controller.ts`
- `apps/backend/src/clock/clock.service.ts`
- `apps/backend/src/clock/clock.module.ts`

**受け入れ基準**:
- POST /api/clock-inが動作する
- POST /api/clock-outが動作する
- GET /api/recordsが動作する
- 共通型定義を使用している

---

#### タスク: データストレージの実装（仮実装）

**内容**:
- メモリ内データストア（初期段階）
- 打刻データの保存・取得機能

**成果物**:
- `apps/backend/src/clock/clock.service.ts`（更新）

**受け入れ基準**:
- データの保存・取得が動作する
- API経由でデータアクセス可能

---

### サポートサイトタスク

#### タスク: product-supportの基本セットアップ

**内容**:
- Astro + Starlightプロジェクトのセットアップ
- TypeScript設定
- 依存パッケージのインストール

**成果物**:
- `sites/product-support/package.json`
- `sites/product-support/tsconfig.json`
- `sites/product-support/astro.config.mjs`

**受け入れ基準**:
- `npm run dev -w sites/product-support`が起動する
- http://localhost:4321でサイトが表示される

---

#### タスク: Starlight設定とカスタマイズ

**内容**:
- サイト情報の設定
- サイドバー構成
- カスタムカラーテーマ（#007CC0）
- ロゴとファビコン（後続で追加）

**成果物**:
- `sites/product-support/astro.config.mjs`（更新）

**受け入れ基準**:
- カスタムカラーが適用されている
- サイドバーナビゲーションが機能する

---

#### タスク: サポートサイトのコンテンツ作成

**内容**:
- トップページ
- 使い方ガイド
- FAQページ

**成果物**:
- `sites/product-support/src/content/docs/index.md`
- `sites/product-support/src/content/docs/getting-started.md`
- `sites/product-support/src/content/docs/faq.md`

**受け入れ基準**:
- すべてのページが表示される
- リンクが正常に動作する
- Markdown形式が正しい

---

### 統合・検証タスク

#### タスク: ワークスペースの動作確認

**内容**:
- すべてのパッケージが相互参照可能か確認
- ビルドスクリプトの動作確認

**テスト項目**:
- `npm install`が成功する
- `npm run dev`ですべての開発サーバーが起動する
- `npm run build`ですべてのビルドが成功する

**受け入れ基準**:
- すべてのテスト項目をパスする

---

#### タスク: レスポンシブデザインの動作確認

**内容**:
- フロントエンドのレスポンシブ動作確認
- 各ブレークポイントでの表示確認

**テスト項目**:
- デスクトップ（1920x1080）での表示
- タブレット（1024x768）での表示
- スマートフォン（375x667）での表示

**受け入れ基準**:
- すべての解像度で適切に表示される
- UI要素が使いやすい

---

#### タスク: APIとフロントエンドの統合テスト

**内容**:
- フロントエンドからバックエンドAPI呼び出し
- データの受け渡し確認

**テスト項目**:
- 出勤打刻が正常に動作する
- 退勤打刻が正常に動作する
- 打刻履歴が表示される

**受け入れ基準**:
- すべてのテスト項目をパスする

---

### ドキュメンテーションタスク

#### タスク: READMEの更新

**内容**:
- モノレポ構成の説明追加
- セットアップ手順の更新
- 開発コマンドの説明

**成果物**:
- `README.md`（更新）

**受け入れ基準**:
- 新規開発者がREADMEを読んで環境構築できる

---

#### タスク: 各パッケージのREADME作成

**内容**:
- 各アプリケーション・パッケージのREADME作成
- 簡潔な説明とコマンド例

**成果物**:
- `apps/frontend/README.md`
- `apps/backend/README.md`
- `sites/product-support/README.md`
- `packages/types/README.md`
- `packages/config/README.md`

**受け入れ基準**:
- 各パッケージの目的と使い方が明確

---

## タスクの実行順序

### Phase 1: 基本セットアップ

- ルートpackage.jsonの作成
- TypeScript基本設定の作成
- .gitignoreの更新

### Phase 2: 共通パッケージ

- packages/typesの作成
- packages/configの作成

### Phase 3: フロントエンド

- frontendの基本セットアップ
- フロントエンドの基本コンポーネント作成
- 打刻コンポーネントの作成
- フロントエンドAPIサービスの作成

### Phase 4: バックエンド

- backendの基本セットアップ
- バックエンドの基本構造作成
- 打刻APIの実装
- データストレージの実装

### Phase 5: サポートサイト

- product-supportの基本セットアップ
- Starlight設定とカスタマイズ
- サポートサイトのコンテンツ作成

### Phase 6: 統合・検証

- ワークスペースの動作確認
- レスポンシブデザインの動作確認
- APIとフロントエンドの統合テスト

### Phase 7: ドキュメント

- READMEの更新
- 各パッケージのREADME作成

## 見積もり

各フェーズの想定作業時間:
- Phase 1: 30分
- Phase 2: 30分
- Phase 3: 2時間
- Phase 4: 2時間
- Phase 5: 1時間
- Phase 6: 1時間
- Phase 7: 30分

**合計**: 約7.5時間
