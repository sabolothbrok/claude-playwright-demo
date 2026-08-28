import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/** Matches the `value` attributes of the sort dropdown's <option>s. */
export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

/**
 * Page Object for the "Products" / inventory page (/inventory.html),
 * the landing page after a successful login.
 */
export class InventoryPage extends BasePage {
  readonly inventoryList: Locator;
  readonly inventoryItems: Locator;
  readonly sortDropdown: Locator;
  readonly pageTitle: Locator;

  constructor(page: Page) {
    super(page);
    this.inventoryList = page.locator('.inventory_list');
    this.inventoryItems = page.locator('.inventory_item');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.pageTitle = page.locator('.title');
  }

  async goto(): Promise<void> {
    await this.page.goto('/inventory.html');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/inventory\.html/);
    await expect(this.inventoryList).toBeVisible();
  }

  async getItemCount(): Promise<number> {
    return this.inventoryItems.count();
  }

  async getItemNames(): Promise<string[]> {
    return this.inventoryItems.locator('.inventory_item_name').allInnerTexts();
  }

  async getItemPrices(): Promise<number[]> {
    const texts = await this.inventoryItems.locator('.inventory_item_price').allInnerTexts();
    return texts.map((t) => Number(t.replace('$', '')));
  }

  private itemCard(productName: string): Locator {
    return this.inventoryItems.filter({
      has: this.page.locator('.inventory_item_name', { hasText: productName }),
    });
  }

  async addToCartByName(productName: string): Promise<void> {
    const card = this.itemCard(productName);
    await card.getByRole('button', { name: /^Add to cart$/ }).click();
  }

  async removeFromCartByName(productName: string): Promise<void> {
    const card = this.itemCard(productName);
    await card.getByRole('button', { name: /^Remove$/ }).click();
  }

  async openProductByName(productName: string): Promise<void> {
    await this.inventoryItems
      .filter({ hasText: productName })
      .locator('.inventory_item_name')
      .click();
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }
}
