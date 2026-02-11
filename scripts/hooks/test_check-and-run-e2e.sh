#!/bin/bash
set -euo pipefail

# check-and-run-e2e.shのテストスクリプト

main() {
  local test_count=0
  local passed_count=0
  
  echo "=== check-and-run-e2e.sh テスト開始 ==="
  echo ""
  
  # テスト1: JSONパースのテスト
  test_count=$((test_count + 1))
  if test_json_parsing; then
    passed_count=$((passed_count + 1))
    echo "✓ テスト1: JSONパースのテスト"
  else
    echo "✗ テスト1: JSONパースのテスト"
  fi
  
  # テスト2: スクリプトの構文チェック
  test_count=$((test_count + 1))
  if test_script_syntax; then
    passed_count=$((passed_count + 1))
    echo "✓ テスト2: スクリプトの構文チェック"
  else
    echo "✗ テスト2: スクリプトの構文チェック"
  fi
  
  # テスト3: 実行権限チェック
  test_count=$((test_count + 1))
  if test_script_executable; then
    passed_count=$((passed_count + 1))
    echo "✓ テスト3: 実行権限チェック"
  else
    echo "✗ テスト3: 実行権限チェック"
  fi
  
  echo ""
  echo "=== テスト結果 ==="
  echo "合計: ${test_count}"
  echo "成功: ${passed_count}"
  echo "失敗: $((test_count - passed_count))"
  
  if [[ ${passed_count} -eq ${test_count} ]]; then
    echo ""
    echo "すべてのテストが成功しました ✓"
    exit 0
  else
    echo ""
    echo "一部のテストが失敗しました ✗"
    exit 1
  fi
}

test_script_syntax() {
  local script_path
  script_path="$(dirname "${BASH_SOURCE[0]}")/check-and-run-e2e.sh"
  
  if bash -n "${script_path}"; then
    return 0
  else
    echo "  失敗: スクリプトの構文エラー"
    return 1
  fi
}

test_script_executable() {
  local script_path
  script_path="$(dirname "${BASH_SOURCE[0]}")/check-and-run-e2e.sh"
  
  if [[ -x "${script_path}" ]]; then
    return 0
  else
    echo "  失敗: スクリプトに実行権限がありません"
    return 1
  fi
}

test_json_parsing() {
  # JSONパースのテスト
  local test_json='{"timestamp": 1704614700000, "cwd": "/path/to/project", "toolName": "edit", "toolResult": {"resultType": "success"}}'
  
  local tool_name
  local result_type
  
  tool_name=$(echo "${test_json}" | jq -r '.toolName')
  result_type=$(echo "${test_json}" | jq -r '.toolResult.resultType')
  
  if [[ "${tool_name}" != "edit" ]]; then
    echo "  失敗: toolName の解析が正しくありません (期待: edit, 実際: ${tool_name})"
    return 1
  fi
  
  if [[ "${result_type}" != "success" ]]; then
    echo "  失敗: resultType の解析が正しくありません (期待: success, 実際: ${result_type})"
    return 1
  fi
  
  return 0
}

main
