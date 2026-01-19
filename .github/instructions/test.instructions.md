---
applyTo: "**/test_*.sh"
---
# Copilot Instruction for Test

- テストファイルはテスト対象と同一ディレクトリに配置する。
- ファイル名は`test_*.sh`とする。
- `test_helper.sh`を利用する。
- 関数ごとにテストを記述する。
- テスト関数は`_test`で終わる。
- テスト関数は`main`関数から呼び出す。
- テスト実行は`execute_tests`を利用する。
- 関数内は`()`で囲む。
- 原則パラメータ化テスト`execute_parametrized_test`を利用する。
