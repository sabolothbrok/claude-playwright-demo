import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/** Page Object for a single product detail page (/inventory-item.html?id=N). */
export class ProductDetailPage extends BasePage {
  readonly itemName: Locator;
  readonly itemDescription: Locator;
  readonly itemPrice: Locator;
  readonly itemImage: Locator;
  readonly addToCartButton: Locator;
  readonly removeButton: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    super(page);
    this.itemName = page.locator('.inventory_details_name');
    this.itemDescription = page.locator('.inventory_details_desc');
    this.itemPrice = page.locator('.inventory_details_price');
    this.itemImage = page.locator('.inventory_details_img');
    this.addToCartButton = page.getByRole('button', { name: /^Add to cart$/ });
    this.removeButton = page.getByRole('button', { name: /^Remove$/ });
    this.backButton = page.locator('[data-test="back-to-products"]');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/inventory-item\.html/);
    await expect(this.itemName).toBeVisible();
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  async removeFromCart(): Promise<void> {
    await this.removeButton.click();
  }

  async backToProducts(): Promise<void> {
    await this.backButton.click();
  }
}
