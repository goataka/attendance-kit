#!/bin/bash
# Visual regression screenshot capture script
# This script captures screenshots of each page for visual regression testing
# Screenshots are saved per page and only updated when changes are detected

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR"
PAGES=(
  "ClockInOutPage"
  "ClocksListPage"
)

echo "📸 Starting visual regression screenshot capture..."

# Check if dev server is already running
if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
  echo "⚠️  Dev server not running. Please start it with 'npm run dev' first."
  exit 1
fi

# Install Playwright browsers if needed
if [ ! -d "$HOME/.cache/ms-playwright" ]; then
  echo "📦 Installing Playwright browsers..."
  npx playwright install chromium --with-deps
fi

# Run the screenshot capture
echo "🚀 Capturing screenshots..."
cd "$FRONTEND_DIR"
node --input-type=module -e "
import { chromium } from 'playwright';
import { promises as fs } from 'fs';
import { createHash } from 'crypto';
import path from 'path';
import { dirname } from 'path';

const pages = [
  {
    name: 'ClockInOutPage',
    url: '/',
    dir: 'src/ClockInOutPage',
    waitFor: 'h1',
  },
  {
    name: 'ClocksListPage',
    url: '/clocks',
    dir: 'src/ClocksListPage',
    waitFor: '.records-table',
  },
];

async function captureScreenshots() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();

  let updatedCount = 0;
  let unchangedCount = 0;

  for (const pageConfig of pages) {
    console.log(\`\n📸 Capturing screenshot for \${pageConfig.name}...\`);
    
    try {
      await page.goto(\`http://localhost:5173\${pageConfig.url}\`, {
        waitUntil: 'networkidle',
      });
      await page.waitForSelector(pageConfig.waitFor, { timeout: 5000 });
      
      // Wait a bit for any animations
      await page.waitForTimeout(500);

      const screenshotPath = path.join(
        pageConfig.dir,
        \`\${pageConfig.name}.screenshot.png\`
      );

      // Capture screenshot to buffer
      const screenshotBuffer = await page.screenshot({
        fullPage: true,
      });

      // Check if file exists and compare
      let shouldUpdate = true;
      try {
        const existingBuffer = await fs.readFile(screenshotPath);
        const existingHash = createHash('sha256').update(existingBuffer).digest('hex');
        const newHash = createHash('sha256').update(screenshotBuffer).digest('hex');
        
        if (existingHash === newHash) {
          console.log(\`   ✓ Screenshot unchanged for \${pageConfig.name}\`);
          shouldUpdate = false;
          unchangedCount++;
        }
      } catch (error) {
        // File doesn't exist, will create new
        console.log(\`   ℹ️  No existing screenshot found for \${pageConfig.name}\`);
      }

      if (shouldUpdate) {
        // Ensure directory exists
        await fs.mkdir(dirname(screenshotPath), { recursive: true });
        await fs.writeFile(screenshotPath, screenshotBuffer);
        console.log(\`   ✓ Screenshot updated for \${pageConfig.name}\`);
        updatedCount++;
      }
    } catch (error) {
      console.error(\`   ✗ Failed to capture \${pageConfig.name}: \${error.message}\`);
      throw error;
    }
  }

  await browser.close();

  console.log(\`\n📊 Summary:\`);
  console.log(\`   Updated: \${updatedCount}\`);
  console.log(\`   Unchanged: \${unchangedCount}\`);
  
  return { updatedCount, unchangedCount };
}

captureScreenshots()
  .then(({ updatedCount }) => {
    console.log('\n✅ Screenshot capture completed successfully');
    process.exit(updatedCount > 0 ? 0 : 0);
  })
  .catch((error) => {
    console.error('\n❌ Screenshot capture failed:', error);
    process.exit(1);
  });
"

# Clean up is no longer needed
echo "✅ Visual regression screenshot capture completed"
