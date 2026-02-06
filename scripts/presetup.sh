#!/bin/bash
set -euo pipefail

# 日本語フォントとロケールのセットアップ
# E2Eテストのスクリーンショット文字化け対策

main() {
  echo "=== 日本語環境のセットアップ ==="
  
  # 日本語フォントのインストール
  echo "日本語フォント（Noto CJK）をインストール中..."
  sudo apt-get update -qq
  sudo apt-get install -y fonts-noto-cjk
  
  # ロケール生成
  echo "ロケール（ja_JP.UTF-8）を生成中..."
  sudo locale-gen ja_JP.UTF-8
  
  # 環境変数設定（現在のシェルセッション用）
  export LANG=ja_JP.UTF-8
  export LC_ALL=ja_JP.UTF-8
  
  echo "✓ 日本語環境のセットアップが完了しました"
  echo "  LANG=${LANG}"
  echo "  LC_ALL=${LC_ALL}"
}

main
