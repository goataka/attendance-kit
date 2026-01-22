Feature: Frontend and Backend Integration
  フロントエンドとバックエンドの統合テスト
  LocalStackのDynamoDBを使用し、ローカルサーバーで動作確認

  Background:
    Given LocalStackのDynamoDBが起動している
    And バックエンドサーバーがローカルで起動している
    And フロントエンドサーバーがローカルで起動している

  Scenario: フロントエンドからバックエンドAPIへの接続確認
    When ユーザーがフロントエンドにアクセスする
    Then フロントエンドページが正常に表示される
    And バックエンドAPIへの接続が確立される

  Scenario: Clock-in操作のエンドツーエンドテスト
    Given ユーザーが認証されている
    When ユーザーがClock-inボタンをクリックする
    Then Clock-inデータがDynamoDBに保存される
    And 成功メッセージが表示される
