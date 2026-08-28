import { test, expect } from '@fixtures/pages.fixture';
import { checkoutInfo } from '@data/users';
import { sum } from '@utils/money';

test.describe('Checkout', () => {
  test('completes a full purchase end to end @smoke', async ({
    authenticatedPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
    checkoutCompletePage,
  }) => {
    await authenticatedPage.addToCartByName('Sauce Labs Backpack');
    await authenticatedPage.addToCartByName('Sauce Labs Bike Light');
    await authenticatedPage.goToCart();
    await cartPage.expectLoaded();

    await cartPage.checkout();
    await checkoutStepOnePage.expectLoaded();
    await checkoutStepOnePage.fillInformation(
      checkoutInfo.firstName,
      checkoutInfo.lastName,
      checkoutInfo.postalCode,
    );
    await checkoutStepOnePage.continueToOverview();

    await checkoutStepTwoPage.expectLoaded();
    const subtotal = await checkoutStepTwoPage.getSubtotal();
    const tax = await checkoutStepTwoPage.getTax();
    const total = await checkoutStepTwoPage.getTotal();
    expect(total).toBeCloseTo(sum([subtotal, tax]), 2);

    await checkoutStepTwoPage.finish();
    await checkoutCompletePage.expectLoaded();
    await expect(checkoutCompletePage.completeHeader).toHaveText('Thank you for your order!');
  });

  test('checkout requires first name, last name, and postal code @regression', async ({
    authenticatedPage,
    cartPage,
    checkoutStepOnePage,
  }) => {
    await authenticatedPage.addToCartByName('Sauce Labs Backpack');
    await authenticatedPage.goToCart();
    await cartPage.checkout();
    await checkoutStepOnePage.expectLoaded();

    await checkoutStepOnePage.continueToOverview();
    await expect(checkoutStepOnePage.errorMessage).toContainText('First Name is required');

    await checkoutStepOnePage.firstNameInput.fill('John');
    await checkoutStepOnePage.continueToOverview();
    await expect(checkoutStepOnePage.errorMessage).toContainText('Last Name is required');

    await checkoutStepOnePage.lastNameInput.fill('Doe');
    await checkoutStepOnePage.continueToOverview();
    await expect(checkoutStepOnePage.errorMessage).toContainText('Postal Code is required');
  });

  test('cancel on step one returns to the cart @regression', async ({
    authenticatedPage,
    cartPage,
    checkoutStepOnePage,
  }) => {
    await authenticatedPage.addToCartByName('Sauce Labs Backpack');
    await authenticatedPage.goToCart();
    await cartPage.checkout();
    await checkoutStepOnePage.expectLoaded();
    await checkoutStepOnePage.cancel();
    await cartPage.expectLoaded();
  });

  test('cancel on step two returns to the inventory page @regression', async ({
    authenticatedPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
  }) => {
    await authenticatedPage.addToCartByName('Sauce Labs Backpack');
    await authenticatedPage.goToCart();
    await cartPage.checkout();
    await checkoutStepOnePage.fillInformation(
      checkoutInfo.firstName,
      checkoutInfo.lastName,
      checkoutInfo.postalCode,
    );
    await checkoutStepOnePage.continueToOverview();
    await checkoutStepTwoPage.expectLoaded();
    await checkoutStepTwoPage.cancel();
    await authenticatedPage.expectLoaded();
  });

  test('back to products from the confirmation page resets the cart @regression', async ({
    authenticatedPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
    checkoutCompletePage,
  }) => {
    await authenticatedPage.addToCartByName('Sauce Labs Backpack');
    await authenticatedPage.goToCart();
    await cartPage.checkout();
    await checkoutStepOnePage.fillInformation(
      checkoutInfo.firstName,
      checkoutInfo.lastName,
      checkoutInfo.postalCode,
    );
    await checkoutStepOnePage.continueToOverview();
    await checkoutStepTwoPage.finish();
    await checkoutCompletePage.expectLoaded();

    await checkoutCompletePage.backToProducts();
    await authenticatedPage.expectLoaded();
    expect(await authenticatedPage.getCartItemCount()).toBe(0);
  });
});
