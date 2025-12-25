# 機能仕様: AWS DynamoDB Clock Table CI/CD

**機能ブランチ**: `copilot/build-ci-for-aws-deployment`  
**作成日**: 2025-12-24  
**ステータス**: 下書き  
**入力**: ユーザー説明: "AWSにDynamoDBの打刻テーブル(clock)をデプロイするCI/CDをCDKで構築"

<!--
  🌏 言語ポリシー:
  - この仕様書は日本語で記述してください
  - ユーザーストーリー、要件、説明は日本語で
  - 技術用語は英語を併記しても構いません
-->

## ユーザーシナリオとテスト *(mandatory)*

### ユーザーストーリー 1 - インフラストラクチャの自動デプロイ (優先度: P1)

システム管理者として、GitHub ActionsとAWS CDKを使用してDynamoDBの打刻テーブルを自動的にデプロイしたい。これにより、手動でのAWSコンソール操作を避け、インフラストラクチャをコードとして管理できる。

**この優先度の理由**: インフラストラクチャの基盤となる部分であり、他の機能開発の前提条件となるため最優先。自動化により、環境の再現性と信頼性が確保される。

**独立テスト**: GitHub Actionsワークフローを手動で実行し、DynamoDBテーブルが正しく作成されることをAWSコンソールで確認することで完全にテスト可能。

**受け入れシナリオ**:

1. **前提** インフラストラクチャコードの変更をmainブランチにマージする, **実行** GitHub Actionsワークフローが自動実行される, **結果** DynamoDBテーブル "spec-kit-dev-clock" がAP-NORTHEAST-1リージョンに正常に作成される
2. **前提** GitHub Actionsの手動トリガー画面を開く, **実行** "dev"環境を選択してワークフローを実行する, **結果** ワークフローが成功し、CloudFormationスタックがデプロイされる
3. **前提** 既存のDynamoDBテーブルが存在する, **実行** インフラストラクチャコードを更新してデプロイを実行する, **結果** テーブルが安全に更新される（RETAIN削除ポリシーによりデータは保護される）

---

### ユーザーストーリー 2 - セキュアなAWS認証 (優先度: P1)

システム管理者として、AWSアクセスキーをGitHubに保存せずに、OIDCを使用してGitHub ActionsからAWSに安全に接続したい。これにより、認証情報の漏洩リスクを最小化できる。

**この優先度の理由**: セキュリティは最優先事項であり、認証情報の漏洩は重大なセキュリティインシデントにつながる可能性がある。

**独立テスト**: OIDCの設定を行い、GitHub Actionsワークフローを実行してAWSリソースにアクセスできることを確認することでテスト可能。

**受け入れシナリオ**:

1. **前提** IAM OIDCプロバイダーとロールが設定されている, **実行** GitHub Actionsワークフローを実行する, **結果** 一時的な認証情報でAWSに接続し、デプロイが成功する
2. **前提** GitHubシークレットにAWS_ROLE_TO_ASSUMEが設定されている, **実行** ワークフローがOIDC認証を試みる, **結果** 正常に認証され、永続的な認証情報は使用されない

---

### ユーザーストーリー 3 - CDK Bootstrap の手動実行 (優先度: P1)

システム管理者として、CDK bootstrapを手動ワークフローで実行できるようにしたい。これにより、新しいAWS環境やリージョンでCDKを使用する準備を安全に行える。

**この優先度の理由**: CDK bootstrapは初回デプロイの前提条件であり、環境セットアップの必須ステップ。手動実行により、意図しない環境への実行を防止できる。

**独立テスト**: GitHub Actionsの手動トリガーでbootstrapワークフローを実行し、AWS CloudFormationでCDKToolkitスタックが作成されることを確認することでテスト可能。

**受け入れシナリオ**:

1. **前提** 新しいAWSアカウント/リージョンでCDKを初めて使用する, **実行** GitHub Actionsでbootstrapワークフローを手動実行する, **結果** CDKToolkitスタックが作成され、S3バケットとIAMロールが準備される
2. **前提** 既にbootstrap済みの環境である, **実行** bootstrapワークフローを再実行する, **結果** 既存のリソースが検出され、必要に応じて更新される
3. **前提** GitHub Actionsの手動トリガー画面を開く, **実行** 環境とリージョンを選択してbootstrapを実行する, **結果** 指定した環境・リージョンでbootstrapが成功する

---

### ユーザーストーリー 4 - CloudFormation テンプレートの出力 (優先度: P1)

システム管理者として、CDK synthを手動ワークフローで実行してCloudFormationテンプレートを出力したい。これにより、AWS初期セットアップ時にCloudFormationテンプレートを事前に準備し、手動でのリソース作成に利用できる。

**この優先度の理由**: AWS初期セットアップ（OIDCプロバイダー、IAMロール作成など）の前提条件となるため、P1とする。synthで生成したテンプレートをAWSコンソールで手動実行し、CDKデプロイに必要な権限を準備する。

**独立テスト**: GitHub Actionsでsynthワークフローを手動実行し、成果物としてCloudFormationテンプレートJSONファイルがダウンロード可能であることを確認することでテスト可能。

**受け入れシナリオ**:

1. **前提** インフラストラクチャコードが更新されている, **実行** GitHub Actionsでsynthワークフローを手動実行する, **結果** CloudFormationテンプレートが生成され、成果物としてダウンロード可能になる
2. **前提** synthワークフローが完了している, **実行** 成果物のCloudFormationテンプレートを開く, **結果** DynamoDBテーブルリソース定義が確認できる
3. **前提** CDKコードに構文エラーがある, **実行** synthワークフローを実行する, **結果** ワークフローが失敗し、エラーメッセージが明確に表示される

---

### ユーザーストーリー 5 - テーブル設計の理解 (優先度: P2)

アプリケーション開発者として、打刻テーブルのスキーマ、クエリパターン、制約を理解したい。これにより、効率的にデータの読み書きを実装できる。

**この優先度の理由**: アプリケーション開発の前提となる知識だが、インフラストラクチャが先に構築されれば後から確認可能なため、P2とする。

**独立テスト**: ドキュメントを読み、サンプルデータを使用してDynamoDBテーブルへの読み書きを実行することでテスト可能。

**受け入れシナリオ**:

1. **前提** ドキュメント "aws-deployment.md" を開く, **実行** テーブルスキーマのセクションを読む, **結果** Partition Key、Sort Key、GSIの構成が理解できる
2. **前提** サンプルデータをテーブルに書き込む, **実行** userIdとtimestampを使用してクエリを実行する, **結果** 期待通りのデータが取得できる
3. **前提** 特定日付のデータを取得したい, **実行** DateIndex GSIを使用してクエリを実行する, **結果** 指定日付の全打刻記録が効率的に取得できる

---

### エッジケース

- テーブルが既に存在する場合、デプロイはどう動作するか？
  → CloudFormationが既存リソースを検出し、差分更新を実行する。RETAIN削除ポリシーによりデータは保護される。

- デプロイ中にエラーが発生した場合、どう処理されるか？
  → CloudFormationが自動的にロールバックを実行し、前の安定状態に戻る。GitHub Actionsワークフローはエラーログを出力する。

- 同時に複数のデプロイが実行された場合は？
  → CloudFormationのスタックロックにより、同時実行は防止される。後続のデプロイは待機またはエラーとなる。

- GSI用のdate属性が設定されていないアイテムが書き込まれた場合は？
  → DynamoDBはスパースインデックスとして扱い、date属性を持つアイテムのみがGSIに含まれる。アプリケーションはdate属性を必ず設定する責任がある。

- CDK bootstrapを複数回実行した場合は？
  → CloudFormationが既存のCDKToolkitスタックを検出し、必要に応じて更新する。冪等性が保証される。

- CDK synthでエラーが発生した場合は？
  → TypeScriptのコンパイルエラーまたはCDK構文エラーがログに出力され、ワークフローが失敗する。テンプレートは生成されない。

## 要件 *(mandatory)*

### 機能要件

- **FR-001**: システムはAWS CDKを使用してDynamoDBテーブル "spec-kit-dev-clock" をデプロイできなければならない
- **FR-002**: テーブルはPartition Key "userId" (String) とSort Key "timestamp" (String) を持たなければならない
- **FR-003**: テーブルはGlobal Secondary Index "DateIndex" を持ち、Partition Key "date" (String) とSort Key "timestamp" (String) でクエリ可能でなければならない
- **FR-004**: テーブルはOn-Demand課金モード (PAY_PER_REQUEST) で作成されなければならない
- **FR-005**: テーブルはPoint-in-Time Recovery (PITR) が有効化されていなければならない
- **FR-006**: テーブルはAWS管理キーによる暗号化が設定されていなければならない
- **FR-007**: テーブルはREMOVAL_POLICY: RETAINが設定され、CloudFormationスタック削除時もテーブルが保持されなければならない
- **FR-008**: GitHub ActionsワークフローはOIDC認証を使用してAWSに接続しなければならない
- **FR-009**: ワークフローは手動トリガー (workflow_dispatch) と自動トリガー (infrastructure/配下の変更時) をサポートしなければならない
- **FR-010**: ワークフローはNode.js 20環境でCDKプロジェクトをビルドおよびデプロイしなければならない
- **FR-011**: デプロイ前にCloudFormation変更セットのレビューが可能でなければならない (--require-approval broadening)
- **FR-012**: CloudFormationの出力として、テーブル名とテーブルARNが提供されなければならない
- **FR-013**: CDK bootstrapを手動で実行できるGitHub Actionsワークフローが提供されなければならない
- **FR-014**: Bootstrap ワークフローは環境 (dev/staging) とリージョンを入力パラメータとして受け取らなければならない
- **FR-015**: Bootstrap ワークフローはOIDC認証を使用してAWSに接続しなければならない
- **FR-016**: Bootstrap ワークフローは `cdk bootstrap aws://{ACCOUNT}/{REGION}` コマンドを実行しなければならない
- **FR-017**: CDK synthを手動で実行してCloudFormationテンプレートを出力するGitHub Actionsワークフローが提供されなければならない
- **FR-018**: Synth ワークフローは生成されたCloudFormationテンプレートをGitHub Actions成果物としてアップロードしなければならない
- **FR-019**: Synth ワークフローはTypeScriptのビルドエラーやCDK構文エラーを明確に報告しなければならない
- **FR-020**: Synth ワークフローは環境 (dev/staging) を入力パラメータとして受け取らなければならない

### 主要エンティティ

- **Clock Record (打刻記録)**: ユーザーの出退勤を記録するエンティティ
  - userId: ユーザーを識別する一意のID
  - timestamp: 打刻時刻 (ISO 8601形式)
  - date: 日付 (YYYY-MM-DD形式、GSI用にtimestampから導出)
  - type: 打刻種別 (clock-in / clock-out)
  - location: 打刻場所（オプション）
  - deviceId: 打刻デバイスID（オプション）

- **CDK Stack**: インフラストラクチャを定義するエンティティ
  - Stack Name: SpecKitDevStack
  - Region: ap-northeast-1
  - Resources: DynamoDB Table
  - Outputs: Table Name, Table ARN

- **Bootstrap Workflow**: CDK環境を初期化するワークフロー
  - 手動トリガー専用 (workflow_dispatch)
  - 入力: 環境 (dev/staging)、リージョン
  - 実行: cdk bootstrap
  - 出力: CDKToolkitスタック作成結果

- **Synth Workflow**: CloudFormationテンプレートを生成するワークフロー
  - 手動トリガー専用 (workflow_dispatch)
  - 入力: 環境 (dev/staging)
  - 実行: cdk synth
  - 出力: CloudFormationテンプレート (JSON形式、成果物)

## 成功基準 *(mandatory)*

### 測定可能な成果

- **SC-001**: GitHub Actionsワークフローを実行してから5分以内にDynamoDBテーブルが作成される
- **SC-002**: デプロイの成功率が95%以上である（ネットワークエラーなどの一時的な障害を除く）
- **SC-003**: テーブルのREMOVAL_POLICY設定により、誤ってCloudFormationスタックを削除してもデータは保持される
- **SC-004**: OIDCを使用することで、永続的なAWSアクセスキーがGitHubリポジトリに保存されない（セキュリティスキャンで検証）
- **SC-005**: CDKコードの変更をmainブランチにマージすると、10分以内に自動デプロイが完了する
- **SC-006**: ドキュメントを読むことで、開発者がテーブルスキーマとクエリパターンを30分以内に理解できる
- **SC-007**: CDK bootstrapワークフローを手動実行してから3分以内にCDKToolkitスタックが作成される
- **SC-008**: CDK synthワークフローを手動実行してから2分以内にCloudFormationテンプレートが成果物としてダウンロード可能になる
- **SC-009**: Bootstrap ワークフローは冪等性があり、同じ環境で複数回実行しても安全である
- **SC-010**: Synth ワークフローで生成されたCloudFormationテンプレートは手動レビューが可能な形式（JSON）である

## 前提条件

- AWSアカウントが存在し、適切な権限を持つIAMロールが設定されている
- GitHub ActionsがOIDC経由でAWSに接続するための設定（OIDCプロバイダー、IAMロール）が完了している
- Node.js 20がGitHub Actionsランナーで利用可能である
- CDKがブートストラップされている（初回デプロイ前にbootstrapワークフローまたは `cdk bootstrap` が実行済み）

## スコープ内

- DynamoDBの打刻テーブル（clock）のみ
- dev および staging 環境
- GitHub Actions経由の自動デプロイ
- 手動実行可能なbootstrapワークフロー
- 手動実行可能なsynthワークフロー（CloudFormationテンプレート出力）
- OIDC認証によるセキュアなAWS接続

## スコープ外

- アプリケーションコードの実装（打刻機能のロジック）
- API Gateway / Lambda の実装
- 認証・認可の実装
- データマイグレーション
- 本番環境の構築（devおよびstaging環境のみ）
- 他のDynamoDBテーブル（休暇申請テーブルなど）
