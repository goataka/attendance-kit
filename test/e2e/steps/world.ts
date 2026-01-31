import { World, setWorldConstructor } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from '@playwright/test';

// Custom World class for Cucumber scenarios
// Holds browser instances per scenario for test isolation
export class CustomWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
}

// Set custom World constructor
setWorldConstructor(CustomWorld);
