---
applyTo: '**/*.{sh,ts,js,tsx,jsx,py,yml}'
---

# Copilot Instruction for Coding

cf. [理解しやすいコードの書き方～理解容易性の7つの観点～](https://qiita.com/goataka/items/ae1959c29036dc4929fe)

## 前提

- **識別子（Identifier）**
  - 変数や関数などを他と区別するための名称や記号
- **区画（Block）**
  - 関数やクラスなど、コードのまとまり

## 識別子（Identifier）

### 名称：曖昧 -> 明瞭

識別子の名称は、曖昧ではなく、明瞭とする。

- **命名規則の準拠**
  - リポジトリで採用された命名規則に準拠する
- **適切な英語の使用**
  - プログラムで一般的に使われる英語を使用する
- **省略名の不使用**
  - 名称は省略せず記載する
- **マジックナンバーの不使用**
  - 意味を持った値には適切な名称をつける
- **説明変数/関数の利用**
  - 自明ではない値の場合、変数や関数を定義し、名称を付ける
- **列挙型の利用**
  - 定数をグループ化し、用途を明確にする
- **驚き最小の原則に準拠**
  - 名称と内容を一致させる
- **アノテーションコメントの利用**
  - 意図を表現しきれない時はコメントで残すが、コメントの意味も明示する

### 役割：複数 -> 単一

識別子の役割は、複数ではなく、単一とする。

- **単一責任の原則に準拠（SOLIDの1つ）**
  - 識別子が持つ責務は１つにする
- **モジュール分割**
  - 責務が複数ある場合、分割をする
- **関心の分離**
  - 関心（役割）により、分割をする
- **値オブジェクトの利用**
  - 役割の分離方法として、値の特性ごとに分割する
- **モジュールの凝集度**
  - 同じ役割で纏まるように、分割する
- **インターフェース分離の原則（SOLIDの1つ）**
  - 同じ役割ではないインタフェースは分割する
- **コマンド・クエリ分離の原則**
  - コマンドとクエリは別の関数に分割する

### 状態：可変 -> 不変

識別子の状態は、可変ではなく、不変とする。

- **定数の利用**
  - 変更されない値は変更できないようにする
  - 言語によっては`const`だけでなく、`readonly`なども利用可能である
- **不変オブジェクトの利用**
  - オブジェクトが持つ値を変更できないようする
- **値オブジェクトの利用**
  - 不変オブジェクト化する際に関連する機能群を集約する
- **継承の禁止**
  - 必要のないクラスの継承を禁止する
- **オーバーライドの禁止**
  - 必要のないオーバーライドを禁止する

### 参照：広域 -> 局所

識別子の参照は、広域ではなく、局所とする。

- **モジュールの疎結度**
  - モジュール間の結合度は低くする
- **値のスコープを狭くする**
  - グローバル、フィールド、ローカルとできるだけ狭くする

#### 参照

- **純粋関数への転換**
  - 外部との副作用を持たない関数やクラスに転換する
    - ex. グローバルや環境変数を直接参照せず、引数として受け取る

#### 被参照

- **データ隠蔽**
  - クラスが持つフィールドなどを直接参照させない
- **情報隠蔽**
  - 値を公開せず、必要な処理のみを公開する

## 区画（Block）

### 面積：広大 -> 狭小

区画の面積は、広大ではなく、狭小とする。

- **重複の除去（DRY原則）**
  - 同じ意味で重複したものは1つにする
- **関数の抽出**
  - まとまりごとに関数として抽出する

#### 縦：行数

主処理部分の行数は5～10行程度、全体としても20行程度に収める。

- **デッドコードの除去**
  - 利用されることのなくなった、できないコードは削除する
- **不使用コードの除去（YAGNI）**
  - 現時点で使わないコードは記述しない
- **nullの不使用**
  - 必要な時以外はnullを利用しない
- **値オブジェクトの利用**
  - 直接値を利用せず、値オブジェクトにする
- **3項演算子の利用**
  - 複雑ではない場合、3項演算子を利用する

##### コメント

- **退化コメントの除去**
  - 古くなったと分かったコメントは除外する
- **冗長コメントの除去**
  - 翻訳コメントなど意味のないコメントは除外する
- **コメントアウトの除去**
  - バージョン管理で確認できる内容を残さない

#### 横：字数

単純な行ではなく、一文として80字程度に収める。

- **パラメーターオブジェクトの利用**
  - 引数の数が多い場合、専用のオブジェクトを作成する
- **説明変数/関数の利用**
  - 冗長な条件判定は別途変数や関数に分割する

### 階層：多層 -> 単層

区画の階層は、多層ではなく、単層とする。

- **早期リターン**
  - 主処理の必要性ない条件は先に`return`や`exit`させてしまう
  - ガード節・アーリーリターンとも呼ばれる
  - 類型として、アーリー・コンティニュー もある
- **関数の抽出**
  - ネスト内の処理が多く、更にネストしている場合、別関数に分割する
- **配列・リスト操作関数への転換**
  - ネスト自体を必要としない記述方式に転換する

### 秩序：雑然 -> 整然

区画の秩序は、雑然ではなく、整然とする。

- **簡潔に単純にする（KISS）**
  - おおよそ簡潔かつ単純にする
- **コーディングスタイルの準拠**
  - リポジトリルールがある場合はそれに準拠する
- **コメントは日本語で記述**
  - コード内のコメントは日本語で記述する
  - 理由: チーム内のコミュニケーションを円滑にし、コードの可読性を向上させるため
- **テスト名は日本語で記述**
  - テストケース名（`test()`や`it()`の第一引数）は日本語で記述する
  - テストスイート名（`describe()`の第一引数）も日本語で記述する
  - 理由: チーム内のコミュニケーションを円滑にし、テストの目的を明確にするため
- **Parameterized Test（パラメータ化テスト）の利用**
  - 類似した複数のテストケースは、Parameterized Testを使用して一つにまとめる
  - 理由: テストコードの重複を削減し、テストケースの追加を容易にし、保守性を向上させる
- **段落分け**
  - 意図の纏まりごとに段落を分ける
- **関数の抽出**
  - 意図の纏まりの数が多い場合、それぞれを別の関数に分割する
- **高凝集化**
  - 意図が同じ内容を同じところに纏める
- **カプセル化**
  - データとロジックを同じところに纏める
- **対称性**
  - 大きな意図が同じ名称やブロックでは、対称性や相似性を高くする
- **インフラ・ドメインの分離**
  - ドメインとインフラ層のコードを混ぜない
- **粒度の統一**
  - ロジック内の粒度は統一して記載する

## npm workspace コマンド規約

### monorepo環境でのnpmコマンド実行

monorepo構成で特定のworkspaceのnpmスクリプトを実行する場合、`cd`でディレクトリ移動せず、`--workspace`オプションを使用する。

**OK例**:

```bash
# workspace名を指定して実行
npm run test:integration --workspace=@attendance-kit/backend
npm run build --workspace=@attendance-kit/frontend
npm run test:unit --workspace=@attendance-kit/deploy
```

**NG例**:

```bash
# cdでディレクトリ移動してから実行
cd apps/backend && npm run test:integration
cd apps/frontend && npm run build
cd infrastructure/deploy && npm run test:unit
```

**理由**:

- workspace名による参照は、ディレクトリ構造の変更に強い
- npm workspacesの標準的な使い方に従う
- package.jsonの`name`フィールドで明示的に参照される
- コマンドが簡潔になり、実行位置に依存しない

**適用範囲**:

- ドキュメント内のコマンド例
- スキルファイル内の実行手順
- シェルスクリプト内でのnpmコマンド実行

## Given-When-Then テスト構造

すべての自動テストは Given-When-Then 構造でコメントを記載する。

### 構造

- **Given**: 初期状態のセットアップ（前提条件）
- **When**: ユーザー操作やシステムイベント（実行）
- **Then**: 期待結果の検証（結果）

### 適用対象

- ユニットテスト（React Testing Library、Jest）
- Integration E2Eテスト（Playwright）
- Cucumberステップファイル

### 例（ユニットテスト）

```typescript
test('ログインが成功すること', async () => {
  // Given: 初期状態のセットアップ
  vi.mocked(api.login).mockImplementation(async () => 'mock-token');
  const page = new ClockInOutPageObject();
  page.render();

  // When: ユーザーがログイン操作を実行
  await page.login('user001', 'password123');

  // Then: ログイン成功メッセージが表示される
  await page.expectSuccessMessage('Login successful');
});
```

### 例（Integration E2E）

```typescript
test('ログインが成功し打刻ボタンが有効になること', async ({ page }) => {
  // Given: 打刻ページを表示
  const clockInOutPage = new ClockInOutPage(page);
  await clockInOutPage.goto();

  // When: ログイン操作を実行
  await clockInOutPage.login('user001', 'password123');

  // Then: ログイン成功状態を確認
  await clockInOutPage.expectSuccessMessage('Login successful');
  await clockInOutPage.expectClockButtonsEnabled();
});
```

### 理由

- テストの意図が明確になる（準備→実行→検証）
- 各セクションの責任が明確で保守しやすい
- BDD（振る舞い駆動開発）のベストプラクティスに準拠

## TypeScript Path Mapping

TypeScript Path Mappingを使用してインポートパスを簡略化する。

### 設定ファイル

**apps/frontend/tsconfig.json**:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/ClockInOutPage/*": ["src/ClockInOutPage/*"],
      "@/ClocksListPage/*": ["src/ClocksListPage/*"]
    }
  }
}
```

**apps/frontend/vite.config.ts**:

```typescript
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@/ClockInOutPage': path.resolve(__dirname, 'src/ClockInOutPage'),
      '@/ClocksListPage': path.resolve(__dirname, 'src/ClocksListPage'),
    },
  },
});
```

**tsconfig.json（root）**:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/ClockInOutPage/*": ["apps/frontend/src/ClockInOutPage/*"],
      "@/ClocksListPage/*": ["apps/frontend/src/ClocksListPage/*"]
    }
  }
}
```

**test/e2e/cucumber.js（Cucumber設定）**:

```javascript
module.exports = {
  default: {
    requireModule: ['ts-node/register', 'tsconfig-paths/register'],
    // ... other config
  },
};
```

**package.json（root）**:

```json
{
  "devDependencies": {
    "tsconfig-paths": "^4.2.0"
  }
}
```

### 使用方法

```typescript
// Before: 相対パス
import { ClockInOutPage } from '../../../apps/frontend/src/ClockInOutPage/tests/integration/ClockInOutPage.page';

// After: Path Mapping
import { ClockInOutPage } from '@/ClockInOutPage/tests/integration/ClockInOutPage.page';
```

### 理由

- インポートパスの簡略化によるリファクタリング耐性向上
- ディレクトリ構造変更時の修正箇所削減
- コードの可読性向上

### 注意事項

**重要**: Path Mappingを追加する際は、以下の**5つのファイルすべて**に追加が必須：

1. root/tsconfig.json
2. apps/frontend/tsconfig.json
3. apps/frontend/vite.config.ts
4. test/e2e/cucumber.js（`tsconfig-paths/register`追加）
5. package.json（`tsconfig-paths`パッケージ追加）

**いずれか1つでも欠けると、ビルドエラーやテスト実行エラーが発生する**

