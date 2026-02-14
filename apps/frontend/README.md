# フロントエンド

React + Viteで実装した勤怠管理システムのフロントエンド

## 構成図

```mermaid
graph LR
    User[ユーザー] -->|アクセス| Router

    subgraph "Frontend Server"
        Router[React Router]
        ClockInOut[打刻画面<br/>ClockInOutPage]
        ClocksList[打刻一覧画面<br/>ClocksListPage]
        Shared[shared/]

        Router --> ClockInOut
        Router --> ClocksList

        ClockInOut -.共有コンポーネント.-> Shared
        ClocksList -.共有コンポーネント.-> Shared
    end

    subgraph "Backend Server"
        Backend[Backend API]
    end

    ClockInOut -->|API呼び出し| Backend
    ClocksList -->|API呼び出し| Backend
```

## 技術スタック

- React 18.3.1
- Vite 6.0.3
- TypeScript 5.7.2
- React Router 6.26.2
- Vitest 2.1.8 + React Testing Library 16.1.0
- Playwright 1.48.0
- ESLint 9.15.0

## プロジェクト構造

```text
apps/frontend/
├── src/
│   ├── ClockInOutPage/
│   │   ├── page-objects/        # E2Eテスト用ページオブジェクト
│   │   ├── ClockInOutPage.tsx
│   │   └── ...
│   ├── ClocksListPage/
│   │   ├── page-objects/        # E2Eテスト用ページオブジェクト
│   │   ├── ClocksListPage.tsx
│   │   └── ...
│   ├── shared/
│   │   ├── api/                 # API通信
│   │   ├── types/               # 型定義
│   │   └── constants/           # 定数
│   ├── App.tsx
│   └── main.tsx
├── vite.config.ts
└── playwright.config.ts
```

## テスト

### ユニットテスト

Vitest + React Testing Libraryを使用したコンポーネントテスト

```bash
npm test
```

### E2Eテスト

Playwrightを使用したブラウザテスト。ページオブジェクトパターンを採用しています。

```bash
npm run test:integration
```

#### ページオブジェクト

テストコードの保守性向上のため、ページオブジェクトパターンを使用しています。

配置場所: 各コンポーネントの`page-objects/`ディレクトリ

- `ClockInOutPage/page-objects/ClockInOutPage.ts`: 打刻画面のページオブジェクト
- `ClocksListPage/page-objects/ClocksListPage.ts`: 打刻一覧画面のページオブジェクト

詳細は[E2E README](../../../test/e2e/README.md)を参照してください。

#### スクリーンショット

E2Eテストではビジュアルリグレッションテストのためにスクリーンショットを使用します。

スクリーンショットはGit管理され、テスト実行時に自動的に更新されます。

**テスト実行**:

```bash
npm run test:integration
```

テスト実行後、スクリーンショットが更新された場合は自動的にコミットされます。

**CI環境**: CI環境でも同様にスクリーンショットが更新され、変更があれば自動的にコミットされます。

## コマンド

| コマンド                   | 説明                                        |
| -------------------------- | ------------------------------------------- |
| `npm run dev`              | 開発サーバー起動（<http://localhost:5173>） |
| `npm run build`            | プロダクションビルド                        |
| `npm test`                 | ユニットテスト                              |
| `npm run test:integration` | E2Eテスト                                   |
| `npm run lint`             | Lintチェック                                |
