---

description: "Task list template for feature implementation"
---

# タスク: [FEATURE NAME]

**入力**: `/specs/[###-feature-name]/` の設計ドキュメント
**前提条件**: plan.md (必須), spec.md (ユーザーストーリーに必須), research.md, data-model.md, contracts/

**テスト**: 以下の例にはテストタスクが含まれています。テストはオプションです - 機能仕様で明示的に要求された場合のみ含めてください。

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

## パス規約

- **単一プロジェクト**: `src/`, `tests/` at repository root
- **Webアプリ**: `backend/src/`, `frontend/src/`
- **モバイル**: `api/src/`, `ios/src/` or `android/src/`
- 以下に示すパスは単一プロジェクトを想定 - plan.mdの構造に基づいて調整してください

<!-- 
  ============================================================================
  重要: 
  以下のタスクは説明目的のサンプルタスクです。
  
  /speckit.tasks コマンドは、以下に基づいて実際のタスクに置き換える必要があります:
  - spec.md のユーザーストーリー（優先度 P1, P2, P3...付き）
  - plan.md の機能要件
  - data-model.md のエンティティ
  - contracts/ のエンドポイント
  
  タスクはユーザーストーリーごとに構成する必要があります。各ストーリーは:
  - 独立して実装可能
  - 独立してテスト可能
  - MVP インクリメントとして提供可能
  
  生成される tasks.md ファイルにはこれらのサンプルタスクを残さないでください。
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**目的**: プロジェクトの初期化と基本構造

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize [language] project with [framework] dependencies
- [ ] T003 [P] Configure linting and formatting tools

---

## Phase 2: Foundational（ブロッキング前提条件）

**目的**: すべてのユーザーストーリーを実装する前に完了していなければならないコアインフラストラクチャ

**⚠️ 重要**: このフェーズが完了するまで、ユーザーストーリーの作業を開始できません

基礎タスクの例（プロジェクトに応じて調整）:

- [ ] T004 Setup database schema and migrations framework
- [ ] T005 [P] Implement authentication/authorization framework
- [ ] T006 [P] Setup API routing and middleware structure
- [ ] T007 Create base models/entities that all stories depend on
- [ ] T008 Configure error handling and logging infrastructure
- [ ] T009 Setup environment configuration management

**チェックポイント**: 基礎の準備完了 - ユーザーストーリーの実装を並行して開始可能

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**目標**: [このストーリーが提供するものの簡単な説明]

**独立テスト**: [このストーリーが単独で動作することを確認する方法]

### ユーザーストーリー 1 のテスト（オプション - テストが要求された場合のみ）⚠️

> **注意: これらのテストを最初に書き、実装前に失敗することを確認してください**

- [ ] T010 [P] [US1] Contract test for [endpoint] in tests/contract/test_[name].py
- [ ] T011 [P] [US1] Integration test for [user journey] in tests/integration/test_[name].py

### ユーザーストーリー 1 の実装

- [ ] T012 [P] [US1] Create [Entity1] model in src/models/[entity1].py
- [ ] T013 [P] [US1] Create [Entity2] model in src/models/[entity2].py
- [ ] T014 [US1] Implement [Service] in src/services/[service].py (depends on T012, T013)
- [ ] T015 [US1] Implement [endpoint/feature] in src/[location]/[file].py
- [ ] T016 [US1] Add validation and error handling
- [ ] T017 [US1] Add logging for user story 1 operations

**チェックポイント**: この時点で、ユーザーストーリー 1 は完全に機能し、独立してテスト可能であるべきです

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**目標**: [このストーリーが提供するものの簡単な説明]

**独立テスト**: [このストーリーが単独で動作することを確認する方法]

### ユーザーストーリー 2 のテスト（オプション - テストが要求された場合のみ）⚠️

- [ ] T018 [P] [US2] Contract test for [endpoint] in tests/contract/test_[name].py
- [ ] T019 [P] [US2] Integration test for [user journey] in tests/integration/test_[name].py

### ユーザーストーリー 2 の実装

- [ ] T020 [P] [US2] Create [Entity] model in src/models/[entity].py
- [ ] T021 [US2] Implement [Service] in src/services/[service].py
- [ ] T022 [US2] Implement [endpoint/feature] in src/[location]/[file].py
- [ ] T023 [US2] Integrate with User Story 1 components (if needed)

**チェックポイント**: この時点で、ユーザーストーリー 1 と 2 の両方が独立して動作するべきです

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**目標**: [このストーリーが提供するものの簡単な説明]

**独立テスト**: [このストーリーが単独で動作することを確認する方法]

### ユーザーストーリー 3 のテスト（オプション - テストが要求された場合のみ）⚠️

- [ ] T024 [P] [US3] Contract test for [endpoint] in tests/contract/test_[name].py
- [ ] T025 [P] [US3] Integration test for [user journey] in tests/integration/test_[name].py

### ユーザーストーリー 3 の実装

- [ ] T026 [P] [US3] Create [Entity] model in src/models/[entity].py
- [ ] T027 [US3] Implement [Service] in src/services/[service].py
- [ ] T028 [US3] Implement [endpoint/feature] in src/[location]/[file].py

**チェックポイント**: すべてのユーザーストーリーが独立して機能するようになりました

---

[必要に応じて同じパターンでユーザーストーリーフェーズを追加]

---

## Phase N: 仕上げと横断的関心事

**目的**: 複数のユーザーストーリーに影響する改善

- [ ] TXXX [P] Documentation updates in docs/
- [ ] TXXX Code cleanup and refactoring
- [ ] TXXX Performance optimization across all stories
- [ ] TXXX [P] Additional unit tests (if requested) in tests/unit/
- [ ] TXXX Security hardening
- [ ] TXXX Run quickstart.md validation

---

## 依存関係と実行順序

### フェーズの依存関係

- **Setup (Phase 1)**: 依存関係なし - すぐに開始可能
- **Foundational (Phase 2)**: Setup 完了に依存 - すべてのユーザーストーリーをブロック
- **ユーザーストーリー (Phase 3+)**: すべて Foundational フェーズ完了に依存
  - その後、ユーザーストーリーは並行して進められます（人員がいる場合）
  - または優先度順に順次実行（P1 → P2 → P3）
- **仕上げ (最終フェーズ)**: すべての必要なユーザーストーリーが完了していることに依存

### ユーザーストーリーの依存関係

- **ユーザーストーリー 1 (P1)**: Foundational (Phase 2) 後に開始可能 - 他のストーリーへの依存なし
- **ユーザーストーリー 2 (P2)**: Foundational (Phase 2) 後に開始可能 - US1 と統合する可能性があるが、独立してテスト可能であるべき
- **ユーザーストーリー 3 (P3)**: Foundational (Phase 2) 後に開始可能 - US1/US2 と統合する可能性があるが、独立してテスト可能であるべき

### 各ユーザーストーリー内

- テスト（含まれる場合）は実装前に書かれ、失敗する必要があります
- サービスの前にモデル
- エンドポイントの前にサービス
- 統合の前にコア実装
- 次の優先度に移る前にストーリーを完了

### 並行実行の機会

- [P] マークの付いたすべての Setup タスクは並行実行可能
- [P] マークの付いたすべての Foundational タスクは並行実行可能（Phase 2 内）
- Foundational フェーズ完了後、すべてのユーザーストーリーを並行して開始可能（チームの能力が許せば）
- ユーザーストーリーの [P] マークの付いたすべてのテストは並行実行可能
- ストーリー内の [P] マークの付いたモデルは並行実行可能
- 異なるユーザーストーリーは異なるチームメンバーが並行して作業可能

---

## 並行実行の例: ユーザーストーリー 1

```bash
# ユーザーストーリー 1 のすべてのテストを一緒に起動 (テストが要求された場合):
Task: "Contract test for [endpoint] in tests/contract/test_[name].py"
Task: "Integration test for [user journey] in tests/integration/test_[name].py"

# ユーザーストーリー 1 のすべてのモデルを一緒に起動:
Task: "Create [Entity1] model in src/models/[entity1].py"
Task: "Create [Entity2] model in src/models/[entity2].py"
```

---

## 実装戦略

### MVP 優先 (ユーザーストーリー 1 のみ)

1. Phase 1: Setup を完了
2. Phase 2: Foundational を完了 (重要 - すべてのストーリーをブロック)
3. Phase 3: User Story 1 を完了
4. **停止して検証**: ユーザーストーリー 1 を独立してテスト
5. 準備ができたらデプロイ/デモ

### 段階的な提供

1. Setup + Foundational を完了 → 基礎の準備完了
2. ユーザーストーリー 1 を追加 → 独立してテスト → デプロイ/デモ (MVP!)
3. ユーザーストーリー 2 を追加 → 独立してテスト → デプロイ/デモ
4. ユーザーストーリー 3 を追加 → 独立してテスト → デプロイ/デモ
5. 各ストーリーは、以前のストーリーを壊すことなく価値を追加します

### 並行チーム戦略

複数の開発者がいる場合:

1. チームで Setup + Foundational を一緒に完了
2. Foundational が完了したら:
   - 開発者 A: ユーザーストーリー 1
   - 開発者 B: ユーザーストーリー 2
   - 開発者 C: ユーザーストーリー 3
3. ストーリーを独立して完了し、統合

---

## 注意事項

- [P] タスク = 異なるファイル、依存関係なし
- [Story] ラベルは追跡可能性のためにタスクを特定のユーザーストーリーにマッピング
- 各ユーザーストーリーは独立して完了・テスト可能であるべき
- 実装前にテストが失敗することを確認
- 各タスクまたは論理的なグループの後にコミット
- 任意のチェックポイントで停止してストーリーを独立して検証
- 避けるべきこと: 曖昧なタスク、同じファイルの競合、独立性を損なうストーリー間の依存関係
