---

description: "Task list template for feature implementation"
---

# タスク: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (必須), spec.md (ユーザーストーリーに必須), research.md, data-model.md, contracts/

**Tests**: 以下の例にはテストタスクが含まれています。テストはオプションです - 機能仕様で明示的に要求された場合のみ含めてください。

**Organization**: タスクはユーザーストーリーごとにグループ化され、各ストーリーを独立して実装・テスト可能にします。

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
  
  The /speckit.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/
  
  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment
  
  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**目的**: プロジェクトの初期化と基本構造

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize [language] project with [framework] dependencies
- [ ] T003 [P] Configure linting and formatting tools

---

## Phase 2: Foundational (Blocking Prerequisites)

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

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

> **注意: これらのテストを最初に書き、実装前に失敗することを確認してください**

- [ ] T010 [P] [US1] Contract test for [endpoint] in tests/contract/test_[name].py
- [ ] T011 [P] [US1] Integration test for [user journey] in tests/integration/test_[name].py

### Implementation for User Story 1

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

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

- [ ] T018 [P] [US2] Contract test for [endpoint] in tests/contract/test_[name].py
- [ ] T019 [P] [US2] Integration test for [user journey] in tests/integration/test_[name].py

### Implementation for User Story 2

- [ ] T020 [P] [US2] Create [Entity] model in src/models/[entity].py
- [ ] T021 [US2] Implement [Service] in src/services/[service].py
- [ ] T022 [US2] Implement [endpoint/feature] in src/[location]/[file].py
- [ ] T023 [US2] Integrate with User Story 1 components (if needed)

**チェックポイント**: この時点で、ユーザーストーリー 1 と 2 の両方が独立して動作するべきです

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**目標**: [このストーリーが提供するものの簡単な説明]

**独立テスト**: [このストーリーが単独で動作することを確認する方法]

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

- [ ] T024 [P] [US3] Contract test for [endpoint] in tests/contract/test_[name].py
- [ ] T025 [P] [US3] Integration test for [user journey] in tests/integration/test_[name].py

### Implementation for User Story 3

- [ ] T026 [P] [US3] Create [Entity] model in src/models/[entity].py
- [ ] T027 [US3] Implement [Service] in src/services/[service].py
- [ ] T028 [US3] Implement [endpoint/feature] in src/[location]/[file].py

**チェックポイント**: すべてのユーザーストーリーが独立して機能するようになりました

---

[必要に応じて同じパターンでユーザーストーリーフェーズを追加]

---

## Phase N: Polish & Cross-Cutting Concerns

**目的**: 複数のユーザーストーリーに影響する改善

- [ ] TXXX [P] Documentation updates in docs/
- [ ] TXXX Code cleanup and refactoring
- [ ] TXXX Performance optimization across all stories
- [ ] TXXX [P] Additional unit tests (if requested) in tests/unit/
- [ ] TXXX Security hardening
- [ ] TXXX Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

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

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
