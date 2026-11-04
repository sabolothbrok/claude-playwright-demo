import { test as base } from '@playwright/test';
import {
  LoginPage,
  InventoryPage,
  ProductDetailPage,
  CartPage,
  CheckoutStepOnePage,
  CheckoutStepTwoPage,
  CheckoutCompletePage,
} from '@pages/index';
import { users } from '@data/users';
import { withSteps } from '@utils/steps';
import { labelTest } from '@utils/allure-labels';

/**
 * Custom test fixtures that inject ready-to-use Page Objects into every test,
 * plus an `authenticatedPage` fixture that skips the login flow via UI login
 * once and hands back a Page already on /inventory.html.
 *
 * Usage:
 *   import { test, expect } from '@fixtures/pages.fixture';
 *   test('example', async ({ inventoryPage }) => { ... });
 */
type Pages = {
  _reportLabels: void;
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  productDetailPage: ProductDetailPage;
  cartPage: CartPage;
  checkoutStepOnePage: CheckoutStepOnePage;
  checkoutStepTwoPage: CheckoutStepTwoPage;
  checkoutCompletePage: CheckoutCompletePage;
  /** Page already logged in as the standard user, positioned on /inventory.html. */
  authenticatedPage: InventoryPage;
};

export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => {
    await use(withSteps(new LoginPage(page)));
  },
  inventoryPage: async ({ page }, use) => {
    await use(withSteps(new InventoryPage(page)));
  },
  productDetailPage: async ({ page }, use) => {
    await use(withSteps(new ProductDetailPage(page)));
  },
  cartPage: async ({ page }, use) => {
    await use(withSteps(new CartPage(page)));
  },
  checkoutStepOnePage: async ({ page }, use) => {
    await use(withSteps(new CheckoutStepOnePage(page)));
  },
  checkoutStepTwoPage: async ({ page }, use) => {
    await use(withSteps(new CheckoutStepTwoPage(page)));
  },
  checkoutCompletePage: async ({ page }, use) => {
    await use(withSteps(new CheckoutCompletePage(page)));
  },

  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.expectLoaded();
    await use(withSteps(inventoryPage));
  },

  // Runs for every test: groups the report by feature and marks @smoke as critical.
  _reportLabels: [
    // eslint-disable-next-line no-empty-pattern -- Playwright requires a destructuring pattern here
    async ({}, use, testInfo) => {
      await labelTest(testInfo);
      await use();
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
