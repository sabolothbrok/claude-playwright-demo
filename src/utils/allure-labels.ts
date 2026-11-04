import { epic, feature, severity } from 'allure-js-commons';
import type { TestInfo } from '@playwright/test';

/** Spec file name -> the feature it belongs to in the report. */
const FEATURES: Record<string, string> = {
  login: 'Authentication',
  session: 'Session & access control',
  inventory: 'Product catalog',
  'product-detail': 'Product detail',
  cart: 'Shopping cart',
  checkout: 'Checkout',
};

const specName = (file: string): string => file.replace(/^.*[\\/]/, '').replace(/\.spec\.ts$/, '');

/** Labels a test with epic / feature / severity so reports group by feature, not by file. */
export async function labelTest(testInfo: TestInfo): Promise<void> {
  await epic('Storefront');
  await feature(FEATURES[specName(testInfo.file)] ?? 'Other');
  await severity(testInfo.title.includes('@smoke') ? 'critical' : 'normal');
}
