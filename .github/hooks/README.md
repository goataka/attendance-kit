# GitHub Copilot Hooks

このディレクトリには、GitHub Copilot Agent の動作を拡張・カスタマイズするための hooks 設定が含まれています。

## 設定済みのHooks

### E2E実行の強制 (`e2e-enforcement.json`)

エージェントがドキュメント以外のファイルを変更した場合、自動的にE2Eテストを実行します。

**トリガー**: `postToolUse` - `edit` または `create` ツール使用後

**動作**:

1. ファイル変更を検出
2. 変更がドキュメント以外を含むかチェック
3. 非ドキュメントファイルが変更されている場合、E2Eテストを実行
4. テスト失敗時はエラーを出力

**ドキュメントファイルの定義**:

- `*.md` ファイル
- `docs/` ディレクトリ内のファイル
- `.github/copilot-instructions.md`、`.github/instructions/`、`.github/agents/` 内のファイル
- `README`、`LICENSE`、`CHANGELOG` ファイル

**前提条件**:

E2Eテストを実行するには、以下のサービスが起動している必要があります：

- LocalStack (http://localhost:4566)
- Backend Server (http://localhost:3000)
- Frontend Server (http://localhost:5173)

前提条件が満たされていない場合、警告を表示してテストをスキップします。

## Hooks設定の構造

```json
{
  "version": 1,
  "hooks": {
    "postToolUse": [
      {
        "type": "command",
        "bash": "./scripts/hooks/check-and-run-e2e.sh",
        "cwd": ".",
        "timeoutSec": 300,
        "comment": "非ドキュメントファイル変更時のE2Eテスト実行"
      }
    ]
  }
}
```

## スクリプト

### `scripts/hooks/check-and-run-e2e.sh`

E2Eテスト実行の判断とテスト実行を行うスクリプトです。

**主要な関数**:

- `main()`: エントリポイント。標準入力からJSONを読み込み、処理を開始
- `check_and_run_e2e()`: ファイル変更を検出し、E2Eテストの実行を判断
- `is_documentation_file()`: ファイルがドキュメントかどうかを判定
- `run_e2e_tests()`: E2Eテストを実行
- `check_e2e_prerequisites()`: E2Eテストの前提条件をチェック

## デバッグ

Hooksのデバッグには、以下の方法を使用できます：

### ローカルテスト

```bash
# テスト入力を作成してスクリプトに渡す
echo '{
  "timestamp": 1704614700000,
  "cwd": "/path/to/project",
  "toolName": "edit",
  "toolArgs": "{\"path\":\"src/example.ts\"}",
  "toolResult": {
    "resultType": "success",
    "textResultForLlm": "File edited successfully"
  }
}' | ./scripts/hooks/check-and-run-e2e.sh
```

### ログ確認

スクリプトは標準エラー出力にログを出力します。E2Eテストの出力は `/tmp/e2e-test-output.log` に保存されます。

## トラブルシューティング

### Hooksが実行されない

- JSON ファイルが `.github/hooks/` ディレクトリ内にあるか確認
- 有効な JSON 構文か確認（`jq . .github/hooks/e2e-enforcement.json`）
- `version: 1` が指定されているか確認
- スクリプトが実行可能か確認（`chmod +x scripts/hooks/check-and-run-e2e.sh`）
- スクリプトに shebang があるか確認（`#!/bin/bash`）

### E2Eテストがスキップされる

前提条件のサービスが起動していない可能性があります：

```bash
# LocalStackの起動確認
curl http://localhost:4566/_localstack/health

# Backendの起動確認
curl http://localhost:3000/health

# Frontendの起動確認
curl http://localhost:5173
```

### タイムアウトが発生する

E2Eテストの実行時間が長い場合、`timeoutSec` を増やしてください（デフォルト: 300秒）。

## 参考資料

- [GitHub Copilot Hooks ドキュメント](https://docs.github.com/ja/copilot/how-tos/use-copilot-agents/coding-agent/use-hooks)
- [Hooks 設定リファレンス](https://docs.github.com/ja/copilot/reference/hooks-configuration)
