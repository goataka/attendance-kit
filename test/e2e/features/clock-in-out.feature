Feature: 勤怠打刻機能
  従業員が出勤・退勤を記録する

  Background:
    Given LocalStackのDynamoDBが起動している
    And バックエンドサーバーがローカルで起動している
    And フロントエンドサーバーがローカルで起動している

  Scenario: Clock-in操作のエンドツーエンドテスト
    When ユーザーがClock-inボタンをクリックする
    Then Clock-inデータがDynamoDBに保存される
    And 成功メッセージが表示される
