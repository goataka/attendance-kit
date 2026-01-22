Feature: システム統合テスト
  フロントエンドとバックエンドのシステム接続を確認

  Background:
    Given LocalStackのDynamoDBが起動している
    And バックエンドサーバーがローカルで起動している
    And フロントエンドサーバーがローカルで起動している

  Scenario: フロントエンドからバックエンドAPIへの接続確認
    When ユーザーがフロントエンドにアクセスする
    Then フロントエンドページが正常に表示される
    And バックエンドAPIへの接続が確立される
