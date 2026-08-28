import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/** Page Object for the shopping cart page (/cart.html). */
export class CartPage extends BasePage {
  readonly cartList: Locator;
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    super(page);
    this.cartList = page.locator('.cart_list');
    this.cartItems = page.locator('.cart_item');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/cart\.html/);
    await expect(this.cartList).toBeVisible();
  }

  async getItemNames(): Promise<string[]> {
    return this.cartItems.locator('.inventory_item_name').allInnerTexts();
  }

  async getItemCount(): Promise<number> {
    return this.cartItems.count();
  }

  async removeItemByName(productName: string): Promise<void> {
    await this.cartItems
      .filter({ hasText: productName })
      .getByRole('button', { name: /^Remove$/ })
      .click();
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
