#!/bin/bash
set -euo pipefail

install_japanese_fonts() {
  sudo apt-get update -qq
  sudo apt-get install -y fonts-noto-cjk
}

setup_locale() {
  sudo locale-gen ja_JP.UTF-8
}

set_environment_variables() {
  export LANG=ja_JP.UTF-8
  export LC_ALL=ja_JP.UTF-8
}

main() {
  install_japanese_fonts
  setup_locale
  set_environment_variables
}

main
