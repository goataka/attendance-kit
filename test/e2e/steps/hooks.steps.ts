import { Before, After, AfterAll, BeforeAll, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, Browser } from '@playwright/test';
import { CustomWorld } from './world';
import { verifyServicesRunning } from './services.helper';
import { TIMEOUTS } from './constants';

// Set default timeout for all steps
setDefaultTimeout(TIMEOUTS.DEFAULT_STEP);

// Global browser instance to be shared and properly closed
let globalBrowser: Browser | null = null;

// Setup before all scenarios
BeforeAll(async function () {
  // Wait for all services to be ready before running any tests
  await verifyServicesRunning();
});

// Setup before each scenario
Before(async function (this: CustomWorld) {
  // Create browser if not exists
  if (!globalBrowser) {
    globalBrowser = await chromium.launch({ headless: true });
  }
  this.browser = globalBrowser;
  
  // Create new context and page for each scenario
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
});

// Cleanup after each scenario
After(async function (this: CustomWorld) {
  if (this.page) {
    await this.page.close().catch(() => {});
  }
  if (this.context) {
    await this.context.close().catch(() => {});
  }
});

// Cleanup after all tests
AfterAll(async function () {
  if (globalBrowser) {
    await globalBrowser.close().catch(() => {});
    globalBrowser = null;
  }
});
