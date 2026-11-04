import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/** Page Object for the "Checkout: Complete!" confirmation page (/checkout-complete.html). */
export class CheckoutCompletePage extends BasePage {
  readonly completeHeader: Locator;
  readonly completeText: Locator;
  readonly backHomeButton: Locator;
  readonly ponyExpressImage: Locator;

  constructor(page: Page) {
    super(page);
    this.completeHeader = page.getByTestId('complete-header');
    this.completeText = page.getByTestId('complete-text');
    this.backHomeButton = page.getByRole('button', { name: 'Back Home', exact: true });
    this.ponyExpressImage = page.getByTestId('pony-express');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout-complete\.html/);
    await expect(this.completeHeader).toBeVisible();
  }

  async getConfirmationHeader(): Promise<string> {
    return this.completeHeader.innerText();
  }

  async backToProducts(): Promise<void> {
    await this.backHomeButton.click();
  }
}
