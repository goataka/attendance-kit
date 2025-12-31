# タスク: AWS利用金額アラート

**入力**: `/specs/2-aws-cost-usage-alerts/` の設計ドキュメント
**前提条件**: plan.md (必須), spec.md (ユーザーストーリーに必須)

**構成**: タスクはユーザーストーリーごとにグループ化され、各ストーリーを独立して実装・テスト可能にします。

<!--
  🌏 言語ポリシー:
  - タスクの説明は日本語で記述してください
  - ファイルパスやコード要素は英語のまま
  - 技術的な詳細は英語も併記して構いません
-->

## フォーマット: `[ID] [P?] [Story] 説明`

- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- **[Story]**: このタスクが属するユーザーストーリー（例: US1, US2, US3）
- 説明には正確なファイルパスを含めてください

## Phase 1: Setup（共有インフラストラクチャ）

**目的**: プロジェクトの初期化と基本構造

- [ ] T001 specs/2-aws-cost-usage-alerts/ にドキュメントディレクトリを作成（完了済み）
- [ ] T002 infrastructure/deploy/lib/constructs/ ディレクトリを作成
- [ ] T003 [P] infrastructure/deploy/test/ ディレクトリが存在することを確認（既存）

---

## Phase 2: Foundational（ブロッキング前提条件）

**目的**: すべてのユーザーストーリーを実装する前に完了していなければならないコアインフラストラクチャ

**⚠️ 重要**: このフェーズが完了するまで、ユーザーストーリーの作業を開始できません

- [ ] T004 infrastructure/deploy/lib/constructs/cost-budget.ts にCostBudgetConstruct基本構造を作成
- [ ] T005 CostBudgetProps インターフェースを定義（budgetName, budgetAmountYen, emailEndpoint, environment）
- [ ] T006 [P] infrastructure/deploy/test/cost-budget.test.ts にテストファイルの基本構造を作成

**チェックポイント**: 基礎の準備完了 - ユーザーストーリーの実装を並行して開始可能

---

## Phase 3: ユーザーストーリー 1 - AWS利用額の超過検知（優先度: P1）🎯 MVP

**目標**: 実際の利用額が予算を超えた場合にSNS経由で通知を送信

**独立テスト**: AWSコンソールでBudgetの実利用額アラート設定を確認し、手動でテスト通知を送信して受信確認

### ユーザーストーリー 1 の実装

- [ ] T007 [P] [US1] CostBudgetConstruct に createSnsTopic メソッドを実装
- [ ] T008 [P] [US1] SNS Topic にメールサブスクリプションを追加する機能を実装
- [ ] T009 [US1] CostBudgetConstruct に createBudget メソッドを実装（基本構造）
- [ ] T010 [US1] createBudget に実利用額アラート（ACTUAL, 100%閾値）を追加
- [ ] T011 [US1] SNS Topic に AWS Budgets サービスからのパブリッシュ権限を付与
- [ ] T012 [US1] CostBudgetConstruct のコンストラクタで全メソッドを呼び出し、リソースを作成

### ユーザーストーリー 1 のテスト

- [ ] T013 [P] [US1] test/cost-budget.test.ts にSNS Topic作成のテストを追加
- [ ] T014 [P] [US1] test/cost-budget.test.ts にBudget作成のテストを追加
- [ ] T015 [P] [US1] test/cost-budget.test.ts に実利用額アラート設定のテストを追加

**チェックポイント**: この時点で、実利用額の予算超過アラートが機能し、独立してテスト可能であるべきです

---

## Phase 4: ユーザーストーリー 2 - 予測額の超過検知（優先度: P1）

**目標**: 予測利用額が予算を超える見込みの場合にSNS経由で通知を送信

**独立テスト**: AWSコンソールでBudgetの予測額アラート設定を確認し、予測ロジックが動作することを確認

### ユーザーストーリー 2 の実装

- [ ] T016 [US2] createBudget メソッドに予測額アラート（FORECASTED, 100%閾値）を追加
- [ ] T017 [US2] 実利用額と予測額の両方のアラートがBudgetに設定されていることを確認

### ユーザーストーリー 2 のテスト

- [ ] T018 [P] [US2] test/cost-budget.test.ts に予測額アラート設定のテストを追加
- [ ] T019 [P] [US2] test/cost-budget.test.ts に複数通知設定のテストを追加

**チェックポイント**: この時点で、実利用額と予測額の両方のアラートが独立して動作するべきです

---

## Phase 5: ユーザーストーリー 3 - アラート設定の管理（優先度: P2）

**目標**: インフラストラクチャコードで予算アラートを管理し、環境ごとに設定を分離

**独立テスト**: CDKコードをデプロイし、dev環境とstaging環境で独立したBudgetが作成されることを確認

### ユーザーストーリー 3 の実装

- [ ] T020 [US3] lib/attendance-kit-stack.ts に CostBudgetConstruct をインポート（T004-T012完了後）
- [ ] T021 [US3] AttendanceKitStack に環境ごとの設定を定義（dev, staging）
- [ ] T022 [US3] AttendanceKitStack のコンストラクタで CostBudgetConstruct をインスタンス化
- [ ] T023 [US3] 環境変数から alertEmail を読み込む機能を追加（process.env または context）
- [ ] T024 [US3] dev環境用の CostBudgetConstruct インスタンスを作成

### ユーザーストーリー 3 のテスト

- [ ] T025 [P] [US3] test/attendance-kit-stack.test.ts に CostBudgetConstruct 統合のテストを追加
- [ ] T026 [P] [US3] test/attendance-kit-stack.test.ts に環境ごとの設定差異のテストを追加

**チェックポイント**: すべてのユーザーストーリーが独立して機能し、インフラストラクチャコードで管理されるようになりました

---

## Phase 6: 仕上げと横断的関心事

**目的**: 複数のユーザーストーリーに影響する改善

- [ ] T027 [P] CDKテストを実行し、すべてのテストが成功することを確認（npm test）
- [ ] T028 CDKコードをビルドし、エラーがないことを確認（npm run build）
- [ ] T029 [P] plan.md に記載された未明確化事項を確認し、必要に応じてドキュメントを更新
- [ ] T030 GitHub Actions ワークフローで自動デプロイが動作することを確認
- [ ] T031 [P] README または docs/ に予算アラート機能のドキュメントを追加（オプション）
- [ ] T032 AWSコンソールで手動デプロイテストを実行し、Budget と SNS Topic が作成されることを確認
- [ ] T033 SNSサブスクリプション確認メールを受信し、確認リンクをクリック
- [ ] T034 AWS Budgetのテスト通知機能を使用して、アラートが正常に届くことを確認

---

## 依存関係と実行順序

### フェーズの依存関係

- **Setup (Phase 1)**: 依存関係なし - すぐに開始可能
- **Foundational (Phase 2)**: Setup 完了に依存 - すべてのユーザーストーリーをブロック
- **ユーザーストーリー 1 (Phase 3)**: Foundational フェーズ完了に依存
- **ユーザーストーリー 2 (Phase 4)**: US1 完了に依存（同じBudgetリソースを拡張）
- **ユーザーストーリー 3 (Phase 5)**: US1, US2 完了に依存（既存機能をスタックに統合）
- **仕上げ (Phase 6)**: すべてのユーザーストーリーが完了していることに依存

### ユーザーストーリーの依存関係

- **ユーザーストーリー 1 (P1)**: Foundational 後に開始可能 - SNS と Budget の基本実装
- **ユーザーストーリー 2 (P1)**: US1 のBudgetリソースを拡張するため、US1完了後に開始
- **ユーザーストーリー 3 (P2)**: US1, US2 の機能をスタックに統合するため、両方完了後に開始

### 各ユーザーストーリー内

- US1: createSnsTopic と createBudget は並列実行可能 → その後権限付与
- US2: US1のBudgetに通知を追加するだけ → 依存関係あり
- US3: 完成したConstructをスタックに統合 → US1, US2完了が前提

### 並行実行の機会

- T007, T008 (SNS) と T009 (Budget基本構造) は並列実行可能
- T013, T014, T015 (US1テスト) は並列実行可能
- T018, T019 (US2テスト) は並列実行可能
- T025, T026 (US3テスト) は並列実行可能
- T027, T029, T031 (仕上げ) は並列実行可能

---

## 並行実行の例

### ユーザーストーリー 1

```bash
# 並列実行可能:
Task: "CostBudgetConstruct に createSnsTopic メソッドを実装"
Task: "SNS Topic にメールサブスクリプションを追加する機能を実装"

# その後順次実行:
Task: "CostBudgetConstruct に createBudget メソッドを実装"
Task: "実利用額アラートを追加"
Task: "パブリッシュ権限を付与"
```

### テストフェーズ

```bash
# すべて並列実行可能:
Task: "SNS Topic作成のテストを追加"
Task: "Budget作成のテストを追加"
Task: "実利用額アラート設定のテストを追加"
```

---

## 実装戦略

### MVP 優先（推奨）

1. Phase 1, 2: Setup + Foundational を完了
2. Phase 3: User Story 1 を完了 → 実利用額アラートが動作
3. Phase 4: User Story 2 を完了 → 予測額アラートも動作
4. **停止して検証**: AWSコンソールで手動テスト
5. Phase 5: User Story 3 を完了 → スタックに統合
6. Phase 6: 仕上げとデプロイ

### 段階的な提供

1. US1完了 → 実利用額アラートのみデプロイ・検証可能
2. US2完了 → 予測額アラートも追加して検証可能
3. US3完了 → インフラストラクチャコード化完了
4. 各ストーリーは、以前のストーリーを壊すことなく価値を追加

---

## 注意事項

- [P] タスク = 異なるファイル、依存関係なし
- [Story] ラベルは追跡可能性のためにタスクを特定のユーザーストーリーにマッピング
- US2はUS1のBudgetリソースを拡張するため、順次実行が必要
- CDKテストは実装と並行して記述可能
- 各タスクまたは論理的なグループの後にコミット
- 避けるべきこと: 曖昧なタスク、同じファイルの競合

## 技術メモ

### AWS CDKリソース

- SNS Topic: `aws-cdk-lib/aws-sns` の `Topic` クラス（L2 Construct）
- Budget: `aws-cdk-lib/aws-budgets` の `CfnBudget` クラス（L1 Construct）
- IAM Policy: `aws-cdk-lib/aws-iam` で権限付与

### テストライブラリ

- `aws-cdk-lib/assertions` の `Template.fromStack()`
- `resourceCountIs()` でリソース数を検証
- `hasResourceProperties()` でプロパティを検証

### 環境変数

plan.mdに記載の通り、GitHub Secretsに以下を追加:
- `COST_ALERT_EMAIL_DEV`
- `COST_ALERT_EMAIL_STAGING`

## 関連ドキュメント

### 開発ガイドライン
- [Agent開発ガイドライン](../../.github/agents/AGENTS.md) - Spec-Kitワークフロー、言語ポリシー、コミット規約

### プロジェクト文書
- [機能仕様](./spec.md) - ユーザーストーリーと要件定義
- [実装計画](./plan.md) - 技術アーキテクチャと実装詳細
- [プロジェクト憲法](../../memory/constitution.md) - プロジェクトの原則
