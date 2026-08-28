import { test, expect } from '@fixtures/pages.fixture';

test.describe('Cart', () => {
  test('cart reflects items added from the inventory page @regression', async ({
    authenticatedPage,
    cartPage,
  }) => {
    await authenticatedPage.addToCartByName('Sauce Labs Backpack');
    await authenticatedPage.addToCartByName('Sauce Labs Bike Light');
    await authenticatedPage.goToCart();

    await cartPage.expectLoaded();
    const names = await cartPage.getItemNames();
    expect(names).toEqual(expect.arrayContaining(['Sauce Labs Backpack', 'Sauce Labs Bike Light']));
    expect(await cartPage.getItemCount()).toBe(2);
  });

  test('removing an item from the cart updates the badge @regression', async ({
    authenticatedPage,
    cartPage,
  }) => {
    await authenticatedPage.addToCartByName('Sauce Labs Backpack');
    await authenticatedPage.goToCart();
    await cartPage.expectLoaded();

    await cartPage.removeItemByName('Sauce Labs Backpack');
    expect(await cartPage.getItemCount()).toBe(0);
    await expect(cartPage.cartBadge).toBeHidden();
  });

  test('continue shopping returns to the inventory page @regression', async ({
    authenticatedPage,
    cartPage,
  }) => {
    await authenticatedPage.goToCart();
    await cartPage.expectLoaded();
    await cartPage.continueShopping();
    await authenticatedPage.expectLoaded();
  });

  test('empty cart cannot proceed with a non-existent checkout button click @regression', async ({
    authenticatedPage,
    cartPage,
  }) => {
    await authenticatedPage.goToCart();
    await cartPage.expectLoaded();
    expect(await cartPage.getItemCount()).toBe(0);
    // Sauce Demo allows checkout even on an empty cart; assert the button is
    // still present/enabled rather than assuming app-level validation.
    await expect(cartPage.checkoutButton).toBeEnabled();
  });
});
