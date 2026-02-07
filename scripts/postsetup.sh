#!/bin/bash
set -euo pipefail

install_shellcheck() {
  if command -v shellcheck >/dev/null 2>&1; then
    return 0
  fi

  if command -v apt-get >/dev/null 2>&1; then
    sudo apt-get update -qq
    sudo apt-get install -y -qq shellcheck
  elif command -v brew >/dev/null 2>&1; then
    brew install shellcheck
  else
    echo "警告: shellcheckのインストールに失敗しました。apt-getまたはbrewが必要です。" >&2
    return 1
  fi
}

install_playwright_browsers() {
  echo "Playwrightブラウザをインストールしています..."
  npx playwright install --with-deps chromium
}

main() {
  install_shellcheck
  install_playwright_browsers
}

main "$@"
