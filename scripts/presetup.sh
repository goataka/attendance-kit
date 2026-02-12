#!/bin/bash
set -euo pipefail

install_japanese_fonts() {
  sudo apt-get update -qq
  sudo apt-get install -y fonts-noto-cjk
}

setup_locale() {
  # localesパッケージがインストールされているか確認
  if ! command -v locale-gen >/dev/null 2>&1; then
    if command -v apt-get >/dev/null 2>&1; then
      sudo apt-get install -y locales
    else
      echo "警告: locale-genのインストールに失敗しました。apt-getが必要です。" >&2
      return 1
    fi
  fi

  sudo locale-gen ja_JP.UTF-8
  sudo update-locale LANG=ja_JP.UTF-8 LC_ALL=ja_JP.UTF-8
}

main() {
  install_japanese_fonts
  setup_locale
}

main "$@"
