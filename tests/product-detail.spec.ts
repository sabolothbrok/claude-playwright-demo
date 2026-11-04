import { test, expect } from '@fixtures/pages.fixture';
import { products } from '@data/products';

test.describe('Product detail', () => {
  test('adds a product to the cart from its detail page @regression', async ({
    authenticatedPage,
    productDetailPage,
  }) => {
    await authenticatedPage.openProductByName(products.backpack);
    await productDetailPage.expectLoaded();
    await expect(productDetailPage.cartBadge).toBeHidden();

    await productDetailPage.addToCart();

    await expect(productDetailPage.removeButton).toBeVisible();
    await expect(productDetailPage.addToCartButton).toBeHidden();
    await expect(productDetailPage.cartBadge).toHaveText('1');
  });

  test('removes a product from the cart on its detail page @regression', async ({
    authenticatedPage,
    productDetailPage,
  }) => {
    await authenticatedPage.openProductByName(products.backpack);
    await productDetailPage.expectLoaded();
    await productDetailPage.addToCart();
    await expect(productDetailPage.cartBadge).toHaveText('1');

    await productDetailPage.removeFromCart();

    await expect(productDetailPage.addToCartButton).toBeVisible();
    await expect(productDetailPage.removeButton).toBeHidden();
    await expect(productDetailPage.cartBadge).toBeHidden();
  });

  test('detail page shows the product that was opened @regression', async ({
    authenticatedPage,
    productDetailPage,
  }) => {
    await authenticatedPage.openProductByName(products.bikeLight);
    await productDetailPage.expectLoaded();
    await expect(productDetailPage.itemName).toHaveText(products.bikeLight);
    await expect(productDetailPage.itemPrice).toBeVisible();
  });
});
