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
import { FRONTEND_URL, BACKEND_URL } from './services.helper';

setDefaultTimeout(TIMEOUTS.DEFAULT_STEP);

let globalBrowser: Browser | null = null;
let servicesAvailable = false;

BeforeAll(async function () {
  // サービスが利用可能かチェック
  try {
    const response = await fetch(FRONTEND_URL, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    servicesAvailable = response.ok;
  } catch (error) {
    console.warn('Frontend service not available, tests will be skipped');
    servicesAvailable = false;
  }

  if (servicesAvailable) {
    globalBrowser = await chromium.launch({ headless: true });
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
