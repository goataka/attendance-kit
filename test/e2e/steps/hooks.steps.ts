import {
  Before,
  After,
  AfterAll,
  BeforeAll,
  setDefaultTimeout,
} from '@cucumber/cucumber';
import { chromium, Browser } from '@playwright/test';
import { CustomWorld } from './world';
import { TIMEOUTS } from './constants';
import { FRONTEND_URL, verifyServicesRunning } from './services.helper';

setDefaultTimeout(TIMEOUTS.DEFAULT_STEP);

let globalBrowser: Browser | null = null;
let servicesAvailable = false;

BeforeAll(async function () {
  // サービスが利用可能かチェック
  try {
    await verifyServicesRunning();
    servicesAvailable = true;
    globalBrowser = await chromium.launch({ headless: true });
  } catch (error) {
    console.warn('Services not available, tests will be skipped:', error);
    servicesAvailable = false;
  }
});

Before(async function (this: CustomWorld) {
  if (!servicesAvailable) {
    return 'skipped';
  }

  if (!globalBrowser) {
    globalBrowser = await chromium.launch({ headless: true });
  }
  this.browser = globalBrowser;

  this.context = await this.browser.newContext({
    baseURL: FRONTEND_URL,
  });
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
