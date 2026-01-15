# 課題管理

このフォルダはリポジトリ全体に共通する課題を管理します。

## プロジェクト別課題リンク

各プロジェクトの課題については、以下のリンクから参照してください：

- [Frontend](../apps/frontend/issues/)
- [Backend](../apps/backend/issues/)
- [Website](../apps/website/issues/)
- [Infrastructure](../infrastructure/issues/)

## リポジトリ全体の課題

### プロジェクト構造

#### 候補

- [ ] siteをappsと同レベルにして、sites/developerとproductに分ける
  - 現在: `apps/` 配下にfrontend, backend, websiteが配置
  - 提案: `sites/` を新設し、developer/product向けに分離

### ドキュメント規約

#### 候補

- [ ] ドキュメントの書き方のルールを変える
  - 文書は細かく分割するように指示する
  - コードの引用は原則しない
  - 詳細文書がある場合、内容重複させない

### テスト・開発環境

#### 検討

- [ ] integrationテストの実行の仕方を検討する
- [ ] 画像などは見えるようにする
  - 検証結果画像の表示方法
- [ ] 検証結果が分かるようにする
  - テスト実行結果の可視化
- [ ] devcontainerについて考える
  - 現状の`.devcontainer`設定の見直しと改善
- [ ] 仕様駆動の使いどころ
  - 技術調査は別リポジトリの方がやりやすい

#### メモ

- エージェントには自己検証が可能なようにする

## 関連リンク

- [課題ファイルの作成方法](./GUIDE.md)
