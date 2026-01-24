import { Before, After, AfterAll, BeforeAll } from '@cucumber/cucumber';
import { chromium } from '@playwright/test';
import { CustomWorld } from './world';
import { verifyServicesRunning } from './services.helper';

// Setup before all scenarios
BeforeAll(async function () {
  // Wait for all services to be ready before running any tests
  await verifyServicesRunning();
});

// Setup before each scenario
Before(async function (this: CustomWorld) {
  // Create browser if not exists
  if (!this.browser) {
    this.browser = await chromium.launch({ headless: true });
  }
  
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
AfterAll(async function (this: CustomWorld) {
  if (this.browser) {
    await this.browser.close().catch(() => {});
  }
});
