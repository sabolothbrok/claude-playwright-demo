import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/** Page Object for the "Checkout: Overview" step (/checkout-step-two.html). */
export class CheckoutStepTwoPage extends BasePage {
  readonly cartItems: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.cartItems = page.locator('.cart_item');
    this.subtotalLabel = page.locator('.summary_subtotal_label');
    this.taxLabel = page.locator('.summary_tax_label');
    this.totalLabel = page.locator('.summary_total_label');
    this.finishButton = page.locator('#finish');
    this.cancelButton = page.locator('#cancel');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout-step-two\.html/);
    await expect(this.totalLabel).toBeVisible();
  }

  async getSubtotal(): Promise<number> {
    const text = await this.subtotalLabel.innerText();
    return Number(text.replace('Item total: $', ''));
  }

  async getTax(): Promise<number> {
    const text = await this.taxLabel.innerText();
    return Number(text.replace('Tax: $', ''));
  }

  async getTotal(): Promise<number> {
    const text = await this.totalLabel.innerText();
    return Number(text.replace('Total: $', ''));
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
