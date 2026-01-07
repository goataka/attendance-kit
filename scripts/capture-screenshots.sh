#!/bin/bash

# スクリーンショット撮影スクリプト
# このスクリプトは、Playwrightを使用してアプリケーションのスクリーンショットを自動撮影します

set -e

echo "📸 スクリーンショット撮影を開始します..."

# 必要なディレクトリを作成
SCREENSHOT_DIR="apps/site/public/images/screenshots"
mkdir -p "$SCREENSHOT_DIR"

# Playwrightがインストールされているか確認
if ! command -v npx &> /dev/null; then
    echo "❌ npxが見つかりません。Node.jsをインストールしてください。"
    exit 1
fi

# 一時的なPlaywrightスクリプトを作成
TEMP_SCRIPT=$(mktemp)
cat > "$TEMP_SCRIPT" << 'EOF'
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    args: [
      '--font-render-hinting=none',
      '--disable-font-subpixel-positioning',
    ]
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'ja-JP',
    // 日本語フォントの読み込みを確実にする
    screen: { width: 1920, height: 1080 },
  });
  
  // 日本語フォントがロードされるまで待機
  const page = await context.newPage();
  await page.addStyleTag({
    content: `
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap');
      * {
        font-family: 'Noto Sans JP', sans-serif !important;
      }
    `
  });

  const baseURL = 'http://localhost:5173';
  const screenshotDir = 'apps/site/public/images/screenshots';

  try {
    console.log('⏳ アプリケーションに接続中...');
    await page.goto(baseURL, { waitUntil: 'networkidle' });

    // 1. 初期画面
    console.log('📸 初期画面を撮影中...');
    await page.screenshot({ 
      path: `${screenshotDir}/01-initial-screen.png`,
      fullPage: false
    });

    // 2. 出勤打刻後
    console.log('📸 出勤打刻を実行中...');
    await page.fill('input[placeholder*="user"]', 'user001');
    await page.fill('input[placeholder*="名前"]', '山田太郎');
    await page.click('button:has-text("出勤打刻")');
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: `${screenshotDir}/02-after-clock-in.png`,
      fullPage: false
    });

    // 3. 退勤打刻後
    console.log('📸 退勤打刻を実行中...');
    await page.click('button:has-text("退勤打刻")');
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: `${screenshotDir}/03-after-clock-out.png`,
      fullPage: false
    });

    console.log('✅ すべてのスクリーンショットを撮影しました');
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
EOF

# Playwrightを使用してスクリーンショットを撮影
echo "⚙️  Playwrightをインストール中..."
npx -y playwright install chromium

echo "🚀 フロントエンドサーバーが起動していることを確認してください (http://localhost:5173)"
echo "   起動していない場合は、別のターミナルで 'npm run dev:frontend' を実行してください"
echo ""
read -p "フロントエンドサーバーは起動していますか? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ フロントエンドサーバーを起動してから再度実行してください"
    rm "$TEMP_SCRIPT"
    exit 1
fi

echo "📸 スクリーンショットを撮影中..."
node "$TEMP_SCRIPT"

# 一時ファイルを削除
rm "$TEMP_SCRIPT"

echo ""
echo "✅ スクリーンショットの撮影が完了しました"
echo "   保存先: $SCREENSHOT_DIR"
echo ""
echo "📝 次のステップ:"
echo "   1. 撮影された画像を確認してください"
echo "   2. 必要に応じて画像を編集してください"
echo "   3. git add で画像をステージングしてください"
