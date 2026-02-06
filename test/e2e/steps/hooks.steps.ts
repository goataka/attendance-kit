import {
  Before,
  After,
  AfterAll,
  BeforeAll,
  setDefaultTimeout,
} from '@cucumber/cucumber';
import { chromium, Browser } from '@playwright/test';
import { CustomWorld } from './world';
import { verifyServicesRunning } from './services.helper';
import { TIMEOUTS } from './constants';

setDefaultTimeout(TIMEOUTS.DEFAULT_STEP);

let globalBrowser: Browser | null = null;

BeforeAll(async function () {
  await verifyServicesRunning();
});

Before(async function (this: CustomWorld) {
  if (!globalBrowser) {
    globalBrowser = await chromium.launch({ headless: true });
  }
  this.browser = globalBrowser;

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
