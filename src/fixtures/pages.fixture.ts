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
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  productDetailPage: async ({ page }, use) => {
    await use(new ProductDetailPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutStepOnePage: async ({ page }, use) => {
    await use(new CheckoutStepOnePage(page));
  },
  checkoutStepTwoPage: async ({ page }, use) => {
    await use(new CheckoutStepTwoPage(page));
  },
  checkoutCompletePage: async ({ page }, use) => {
    await use(new CheckoutCompletePage(page));
  },

  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.expectLoaded();
    await use(inventoryPage);
  },
});

export { expect } from '@playwright/test';
