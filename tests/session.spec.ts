import { test, expect } from '@fixtures/pages.fixture';
import { products } from '@data/products';

test.describe('Session and access control', () => {
  test('logged-out users cannot open the inventory page @regression', async ({
    loginPage,
    inventoryPage,
  }) => {
    await inventoryPage.goto();

    await loginPage.expectLoaded();
    await expect(loginPage.errorMessage).toContainText(
      "You can only access '/inventory.html' when you are logged in",
    );
  });

  test('cart contents survive a page reload @regression', async ({ authenticatedPage }) => {
    await authenticatedPage.addToCartByName(products.backpack);
    await expect(authenticatedPage.cartBadge).toHaveText('1');

    await authenticatedPage.reload();

    await authenticatedPage.expectLoaded();
    await expect(authenticatedPage.cartBadge).toHaveText('1');
  });
});
