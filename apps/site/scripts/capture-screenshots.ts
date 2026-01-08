/**
 * スクリーンショット撮影スクリプト
 * 
 * フロントエンド（http://localhost:5173）の3つの画面をキャプチャし、
 * public/images/screenshots/ ディレクトリに保存します。
 * 
 * 使い方:
 *   npm run screenshot       # 対話的モード（確認あり）
 *   npm run screenshot:auto  # 自動モード（確認なし）
 */

import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'public', 'images', 'screenshots');
const FRONTEND_URL = 'http://localhost:5173';
const BACKEND_URL = 'http://localhost:3000';

// 自動モードかどうかを判定
const AUTO_MODE = process.argv.includes('--auto');

/**
 * フロントエンドとバックエンドが起動しているか確認
 */
async function checkServers(): Promise<void> {
  try {
    const frontendResponse = await fetch(FRONTEND_URL);
    const backendResponse = await fetch(`${BACKEND_URL}/api/health`).catch(() => ({ ok: true }));
    
    if (!frontendResponse.ok) {
      console.error(`❌ フロントエンド (${FRONTEND_URL}) が起動していません`);
      process.exit(1);
    }
    
    console.log('✅ サーバーの起動を確認しました');
  } catch (error) {
    const err = error as Error;
    console.error(`❌ サーバーの起動確認に失敗しました: ${err.message}`);
    console.error('\n以下のコマンドでサーバーを起動してください:');
    console.error('  ターミナル1: npm run dev:frontend');
    console.error('  ターミナル2: npm run dev:backend');
    process.exit(1);
  }
}

/**
 * スクリーンショットを撮影
 */
async function captureScreenshots(): Promise<void> {
  console.log('🚀 スクリーンショット撮影を開始します...\n');
  
  const browser: Browser = await chromium.launch({
    headless: true,
  });
  
  const context: BrowserContext = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'ja-JP',
    timezoneId: 'Asia/Tokyo',
    // 日本語フォントを確実に読み込むための設定
    extraHTTPHeaders: {
      'Accept-Language': 'ja-JP,ja;q=0.9',
    },
  });
  
  // 日本語フォントのスタイルを注入
  await context.addInitScript(() => {
    const style = document.createElement('style');
    style.textContent = `
      * {
        font-family: "Noto Sans JP", "Yu Gothic", "Meiryo", "Hiragino Sans", "Hiragino Kaku Gothic ProN", sans-serif !important;
      }
    `;
    document.head.appendChild(style);
  });
  
  const page: Page = await context.newPage();
  
  try {
    // 1. 初期画面
    console.log('📸 1/3: 初期画面を撮影中...');
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle' });
    // ページが完全にレンダリングされるまで待機
    await page.waitForTimeout(2000);
    // フォントが読み込まれるまで待機
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ 
      path: join(OUTPUT_DIR, '01-initial-screen.png'),
      fullPage: false
    });
    console.log('   ✅ 01-initial-screen.png を保存しました');
    
    // 2. 出勤打刻後
    console.log('📸 2/3: 出勤打刻後の画面を撮影中...');
    // より正確なセレクタを使用
    await page.fill('input[placeholder="例: user001"]', 'user001');
    await page.fill('input[placeholder="例: 山田太郎"]', 'テスト太郎');
    
    await page.click('button:has-text("出勤")');
    
    // レンダリングとアニメーション待機
    await page.waitForTimeout(2000);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ 
      path: join(OUTPUT_DIR, '02-after-clock-in.png'),
      fullPage: false
    });
    console.log('   ✅ 02-after-clock-in.png を保存しました');
    
    // 3. 退勤打刻後
    console.log('📸 3/3: 退勤打刻後の画面を撮影中...');
    await page.click('button:has-text("退勤")');
    
    // レンダリングとアニメーション待機
    await page.waitForTimeout(2000);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ 
      path: join(OUTPUT_DIR, '03-after-clock-out.png'),
      fullPage: false
    });
    console.log('   ✅ 03-after-clock-out.png を保存しました');
    
    console.log('\n✅ すべてのスクリーンショットを撮影しました！');
    console.log(`📁 保存先: ${OUTPUT_DIR}\n`);
    
  } catch (error) {
    const err = error as Error;
    console.error(`\n❌ スクリーンショット撮影に失敗しました: ${err.message}`);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * ユーザーに確認を求める
 */
async function confirmStart(): Promise<boolean> {
  if (AUTO_MODE) {
    return true;
  }
  
  console.log('📌 スクリーンショット撮影を開始しますか？');
  console.log('   以下のサーバーが起動している必要があります:');
  console.log(`   - フロントエンド: ${FRONTEND_URL}`);
  console.log(`   - バックエンド: ${BACKEND_URL}`);
  console.log('\n   続行する場合は Enter キーを押してください...');
  
  return new Promise((resolve) => {
    process.stdin.once('data', () => {
      resolve(true);
    });
  });
}

/**
 * メイン処理
 */
async function main(): Promise<void> {
  console.log('🖼️  スクリーンショット撮影スクリプト\n');
  
  // サーバーの起動確認
  await checkServers();
  
  // ユーザー確認（自動モードでは省略）
  await confirmStart();
  
  // スクリーンショット撮影
  await captureScreenshots();
  
  process.exit(0);
}

main().catch((error: Error) => {
  console.error('❌ エラーが発生しました:', error);
  process.exit(1);
});
