import { test, expect } from '@fixtures/pages.fixture';

test.describe('Inventory', () => {
  test('displays all six products @smoke', async ({ authenticatedPage }) => {
    await expect(authenticatedPage.inventoryItems).toHaveCount(6);
  });

  test('can add a product to the cart from the list @regression', async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.addToCartByName('Sauce Labs Backpack');
    await expect(authenticatedPage.cartBadge).toHaveText('1');
  });

  test('can remove a product after adding it @regression', async ({ authenticatedPage }) => {
    await authenticatedPage.addToCartByName('Sauce Labs Backpack');
    await expect(authenticatedPage.cartBadge).toHaveText('1');
    await authenticatedPage.removeFromCartByName('Sauce Labs Backpack');
    await expect(authenticatedPage.cartBadge).toBeHidden();
  });

  test('adding multiple products increments the cart badge @regression', async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.addToCartByName('Sauce Labs Backpack');
    await authenticatedPage.addToCartByName('Sauce Labs Bike Light');
    await authenticatedPage.addToCartByName('Sauce Labs Bolt T-Shirt');
    await expect(authenticatedPage.cartBadge).toHaveText('3');
  });

  test('sorts products by name A to Z @regression', async ({ authenticatedPage }) => {
    await authenticatedPage.sortBy('az');
    const names = await authenticatedPage.getItemNames();
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });

  test('sorts products by name Z to A @regression', async ({ authenticatedPage }) => {
    await authenticatedPage.sortBy('za');
    const names = await authenticatedPage.getItemNames();
    const sorted = [...names].sort((a, b) => b.localeCompare(a));
    expect(names).toEqual(sorted);
  });

  test('sorts products by price low to high @regression', async ({ authenticatedPage }) => {
    await authenticatedPage.sortBy('lohi');
    const prices = await authenticatedPage.getItemPrices();
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  });

  test('sorts products by price high to low @regression', async ({ authenticatedPage }) => {
    await authenticatedPage.sortBy('hilo');
    const prices = await authenticatedPage.getItemPrices();
    const sorted = [...prices].sort((a, b) => b - a);
    expect(prices).toEqual(sorted);
  });

  test('navigating to a product shows its detail page @regression', async ({
    authenticatedPage,
    productDetailPage,
  }) => {
    await authenticatedPage.openProductByName('Sauce Labs Backpack');
    await productDetailPage.expectLoaded();
    await expect(productDetailPage.itemName).toHaveText('Sauce Labs Backpack');
    await productDetailPage.backToProducts();
    await authenticatedPage.expectLoaded();
  });
});
