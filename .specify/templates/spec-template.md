# 機能仕様 / Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`  
**Created**: [DATE]  
**Status**: Draft  
**Input**: User description: "$ARGUMENTS"

<!--
  🌏 言語ポリシー / Language Policy:
  - この仕様書は日本語で記述してください / Write this specification in Japanese
  - ユーザーストーリー、要件、説明は日本語で / User stories, requirements, and descriptions in Japanese
  - 技術用語は英語を併記しても構いません / Technical terms may include English alongside
-->

## ユーザーシナリオとテスト / User Scenarios & Testing *(mandatory)*

<!--
  重要 / IMPORTANT: 
  ユーザーストーリーは重要度順に優先順位付けしてください。
  User stories should be PRIORITIZED as user journeys ordered by importance.
  
  各ユーザーストーリー/ジャーニーは独立してテスト可能でなければなりません。
  つまり、1つだけ実装しても価値を提供できるMVP（最小実行可能製品）となるべきです。
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  各ストーリーに優先度（P1, P2, P3など）を割り当ててください。P1が最も重要です。
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  
  各ストーリーは独立した機能スライスとして考えてください：
  Think of each story as a standalone slice of functionality that can be:
  - 独立して開発可能 / Developed independently
  - 独立してテスト可能 / Tested independently
  - 独立してデプロイ可能 / Deployed independently
  - 独立してユーザーに提示可能 / Demonstrated to users independently
-->

### ユーザーストーリー 1 / User Story 1 - [簡潔なタイトル / Brief Title] (優先度 / Priority: P1)

[このユーザージャーニーを平易な日本語で説明してください / Describe this user journey in plain Japanese]

**この優先度の理由 / Why this priority**: [価値とこの優先度レベルの理由を説明 / Explain the value and why it has this priority level]

**独立テスト / Independent Test**: [独立してテスト可能な方法を説明 - 例：「〇〇という操作で完全にテストでき、〇〇という価値を提供する」/ Describe how this can be tested independently]

**受け入れシナリオ / Acceptance Scenarios**:

1. **前提 / Given** [初期状態], **実行 / When** [アクション], **結果 / Then** [期待される結果]
2. **前提 / Given** [初期状態], **実行 / When** [アクション], **結果 / Then** [期待される結果]

---

### ユーザーストーリー 2 / User Story 2 - [簡潔なタイトル / Brief Title] (優先度 / Priority: P2)

[このユーザージャーニーを平易な日本語で説明してください / Describe this user journey in plain Japanese]

**この優先度の理由 / Why this priority**: [価値とこの優先度レベルの理由を説明 / Explain the value and why it has this priority level]

**独立テスト / Independent Test**: [独立してテスト可能な方法を説明 / Describe how this can be tested independently]

**受け入れシナリオ / Acceptance Scenarios**:

1. **前提 / Given** [初期状態], **実行 / When** [アクション], **結果 / Then** [期待される結果]

---

### ユーザーストーリー 3 / User Story 3 - [簡潔なタイトル / Brief Title] (優先度 / Priority: P3)

[このユーザージャーニーを平易な日本語で説明してください / Describe this user journey in plain Japanese]

**この優先度の理由 / Why this priority**: [価値とこの優先度レベルの理由を説明 / Explain the value and why it has this priority level]

**独立テスト / Independent Test**: [独立してテスト可能な方法を説明 / Describe how this can be tested independently]

**受け入れシナリオ / Acceptance Scenarios**:

1. **前提 / Given** [初期状態], **実行 / When** [アクション], **結果 / Then** [期待される結果]

---

[必要に応じてユーザーストーリーを追加、各ストーリーに優先度を割り当ててください / Add more user stories as needed, each with an assigned priority]

### エッジケース / Edge Cases

<!--
  必須対応 / ACTION REQUIRED: 
  このセクションの内容はプレースホルダーです。
  適切なエッジケースを記入してください。
  The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- [境界条件]が発生した場合の挙動は？ / What happens when [boundary condition]?
- [エラーシナリオ]をシステムはどう処理するか？ / How does system handle [error scenario]?

## 要件 / Requirements *(mandatory)*

<!--
  必須対応 / ACTION REQUIRED: 
  このセクションの内容はプレースホルダーです。
  適切な機能要件を記入してください。
  The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### 機能要件 / Functional Requirements

- **FR-001**: システムは[具体的な機能]ができなければならない / System MUST [specific capability]
- **FR-002**: システムは[具体的な機能]ができなければならない / System MUST [specific capability]
- **FR-003**: ユーザーは[重要な操作]ができなければならない / Users MUST be able to [key interaction]
- **FR-004**: システムは[データ要件]を満たさなければならない / System MUST [data requirement]
- **FR-005**: システムは[動作]をしなければならない / System MUST [behavior]

*不明確な要件の記載例 / Example of marking unclear requirements:*

- **FR-006**: システムは[要明確化: 認証方式が未指定 - メール/パスワード、SSO、OAuth?]でユーザーを認証しなければならない / System MUST authenticate users via [NEEDS CLARIFICATION: auth method not specified]
- **FR-007**: システムは[要明確化: 保持期間が未指定]の間、ユーザーデータを保持しなければならない / System MUST retain user data for [NEEDS CLARIFICATION: retention period not specified]

### 主要エンティティ / Key Entities *(機能がデータを扱う場合に記載 / include if feature involves data)*

- **[エンティティ 1]**: [何を表すか、実装によらない主要な属性 / What it represents, key attributes without implementation]
- **[エンティティ 2]**: [何を表すか、他エンティティとの関係 / What it represents, relationships to other entities]

## 成功基準 / Success Criteria *(mandatory)*

<!--
  必須対応 / ACTION REQUIRED: 
  測定可能な成功基準を定義してください。
  技術に依存せず、測定可能でなければなりません。
  Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### 測定可能な成果 / Measurable Outcomes

- **SC-001**: [測定可能な指標 / Measurable metric] 例: 「ユーザーは2分以内にアカウント作成を完了できる」
- **SC-002**: [測定可能な指標 / Measurable metric] 例: 「システムは1000人の同時ユーザーを品質低下なく処理できる」
- **SC-003**: [ユーザー満足度指標 / User satisfaction metric] 例: 「ユーザーの90%が初回で主要タスクを正常に完了できる」
- **SC-004**: [ビジネス指標 / Business metric] 例: 「[X]に関連するサポートチケットを50%削減する」
