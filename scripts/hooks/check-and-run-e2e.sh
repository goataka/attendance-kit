#!/bin/bash
set -euo pipefail

# postToolUseフックスクリプト
# 非ドキュメントファイルの変更時にE2Eテストを実行

main() {
  local input
  local tool_name
  local result_type
  
  # 標準入力からJSONを読み込み
  input=$(cat)
  
  # ツール名と実行結果を取得
  tool_name=$(echo "${input}" | jq -r '.toolName')
  result_type=$(echo "${input}" | jq -r '.toolResult.resultType')
  
  # ツールが成功した場合のみチェック
  if [[ "${result_type}" != "success" ]]; then
    exit 0
  fi
  
  # edit または create ツールの場合のみチェック
  if [[ "${tool_name}" != "edit" ]] && [[ "${tool_name}" != "create" ]]; then
    exit 0
  fi
  
  # 変更されたファイルをチェック
  check_and_run_e2e "${input}"
}

check_and_run_e2e() {
  local input="${1}"
  local changed_files
  local has_non_doc_changes=false
  
  # git diffで変更されたファイルを取得
  changed_files=$(git diff --name-only HEAD 2>/dev/null || echo "")
  
  # 変更がない場合は終了
  if [[ -z "${changed_files}" ]]; then
    exit 0
  fi
  
  # 変更されたファイルをチェック
  while IFS= read -r file; do
    if ! is_documentation_file "${file}"; then
      has_non_doc_changes=true
      echo "非ドキュメントファイルの変更を検出: ${file}" >&2
      break
    fi
  done <<< "${changed_files}"
  
  # ドキュメント以外の変更がある場合、E2Eテストを実行
  if [[ "${has_non_doc_changes}" == "true" ]]; then
    echo "非ドキュメントファイルが変更されたため、E2Eテストを実行します..." >&2
    run_e2e_tests
  else
    echo "ドキュメントのみの変更のため、E2Eテストをスキップします" >&2
  fi
}

is_documentation_file() {
  local file="${1}"
  
  # ドキュメントファイルのパターン
  # - *.md ファイル
  # - docs/ ディレクトリ内のファイル
  # - .github/ ディレクトリ内の設定ファイル（workflows, actions, instructionsなどを除く）
  # - README, LICENSE, CHANGELOGなど
  
  if [[ "${file}" =~ \.md$ ]]; then
    return 0
  fi
  
  if [[ "${file}" =~ ^docs/ ]]; then
    return 0
  fi
  
  if [[ "${file}" =~ ^\.github/(copilot-instructions\.md|pull_request_template\.md|instructions/|agents/) ]]; then
    return 0
  fi
  
  if [[ "${file}" =~ ^(README|LICENSE|CHANGELOG) ]]; then
    return 0
  fi
  
  # それ以外は非ドキュメントファイル
  return 1
}

run_e2e_tests() {
  # E2Eテストの実行
  # テストが失敗した場合はエラーを出力
  
  echo "E2Eテストを開始..." >&2
  
  # E2Eテストの前提条件をチェック
  if ! check_e2e_prerequisites; then
    echo "警告: E2Eテストの前提条件が満たされていません。テストをスキップします。" >&2
    echo "詳細: LocalStack、Backend、Frontendサーバーが起動している必要があります。" >&2
    return 0
  fi
  
  # E2Eテストを実行
  if npm run test:e2e 2>&1 | tee /tmp/e2e-test-output.log; then
    echo "✓ E2Eテストが成功しました" >&2
  else
    echo "✗ E2Eテストが失敗しました" >&2
    echo "エージェントは非ドキュメントファイルを変更したため、E2Eテストの実行が必要です。" >&2
    echo "テストログ: /tmp/e2e-test-output.log" >&2
    exit 1
  fi
}

check_e2e_prerequisites() {
  # LocalStackが起動しているかチェック
  if ! curl -s http://localhost:4566/_localstack/health > /dev/null 2>&1; then
    echo "LocalStackが起動していません" >&2
    return 1
  fi
  
  # Backendサーバーが起動しているかチェック
  if ! curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "Backendサーバーが起動していません" >&2
    return 1
  fi
  
  # Frontendサーバーが起動しているかチェック
  if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "Frontendサーバーが起動していません" >&2
    return 1
  fi
  
  return 0
}

main
