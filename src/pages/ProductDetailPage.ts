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
    this.itemName = page.getByTestId('inventory-item-name');
    this.itemDescription = page.getByTestId('inventory-item-desc');
    this.itemPrice = page.getByTestId('inventory-item-price');
    this.itemImage = page.getByTestId('inventory-item').getByRole('img');
    this.addToCartButton = page.getByRole('button', { name: /^Add to cart$/ });
    this.removeButton = page.getByRole('button', { name: /^Remove$/ });
    this.backButton = page.getByRole('button', { name: 'Back to products' });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/inventory-item\.html/);
    // The URL changes before the list unmounts, and the app reuses the same data-test
    // ids (inventory-item-name, ...) on the list page. Wait for the Back button, which
    // only the detail page has, so the shared ids below match exactly one element.
    await expect(this.backButton).toBeVisible();
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
