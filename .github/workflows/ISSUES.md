# GitHub Actions ワークフロー課題

このファイルはGitHub Actionsとワークフローに関する課題を管理します。

## 課題一覧

### Lint・品質チェック

#### 候補

- [ ] markdown-lintをプレマージチェックに追加
  - 参考: [markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2)

- [ ] shellcheckをプレマージチェックに追加
  - 参考: [ShellCheck](https://github.com/koalaman/shellcheck)

- [ ] その他のlint導入を検討
  - YAML lint (yamllint/actionlint)
  - 参考: [actionlint](https://github.com/rhysd/actionlint)

### ワークフロー改善

#### 候補

- [ ] コンポジットアクションに関してルール化する
  - [GitHub Actions: Create a composite action](https://docs.github.com/ja/actions/tutorials/create-actions/create-a-composite-action)
  - 再利用可能なアクションの作成ガイドライン策定
  - 共通処理のコンポジットアクション化

- [ ] shの書き方をルール化する
  - shared-shellを参照させる
  - スクリプトのベストプラクティス定義
  - エラーハンドリングの標準化

- [ ] GHAのローカルテストができるようにする
  - 現在: `npm run premerge:local` で実行可能
  - 改善: より使いやすいローカルテスト環境の整備

- [ ] GHAとsh, act、エージェントスキルをルール化する
  - GitHub Actionsワークフロー
  - シェルスクリプト
  - actによるローカル実行
  - Copilot Agentスキル
  - これらの関係性と使い分けの明確化

## 関連リンク

- [GitHub Actions ワークフローサマリー](./README.md)
- [Agent Skills](../skills/README.md)
- [課題ファイルの作成方法](../../issues/GUIDE.md)
