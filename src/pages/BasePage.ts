import { Locator, Page } from '@playwright/test';

/**
 * Base class for every Page Object in the framework.
 * Holds behavior shared across all SauceDemo pages (nav burger menu, toasts,
 * shared waits, etc.) so concrete page objects stay focused on their own UI.
 */
export abstract class BasePage {
  readonly page: Page;

  // Elements shared across (almost) every authenticated page
  readonly burgerMenuButton: Locator;
  readonly closeMenuButton: Locator;
  readonly logoutLink: Locator;
  readonly resetAppStateLink: Locator;
  readonly allItemsLink: Locator;
  readonly aboutLink: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly errorMessage: Locator;
  readonly errorCloseButton: Locator;

  protected constructor(page: Page) {
    this.page = page;
    this.burgerMenuButton = page.getByRole('button', { name: 'Open Menu' });
    this.closeMenuButton = page.getByRole('button', { name: 'Close Menu' });
    // The open sidebar is aria-hidden in the app (an accessibility defect), so role
    // locators cannot see these links; fall back to the app's data-test ids.
    this.logoutLink = page.getByTestId('logout-sidebar-link');
    this.resetAppStateLink = page.getByTestId('reset-sidebar-link');
    this.allItemsLink = page.getByTestId('inventory-sidebar-link');
    this.aboutLink = page.getByTestId('about-sidebar-link');
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.errorMessage = page.getByTestId('error');
    this.errorCloseButton = page.getByTestId('error-button');
  }

  /** Navigate directly to a path relative to baseURL. */
  async goto(path = '/'): Promise<void> {
    await this.page.goto(path);
  }

  /** Current page title as rendered in the DOM (not the browser tab title). */
  async getPageTitle(): Promise<string> {
    return this.page.getByTestId('title').innerText();
  }

  async reload(): Promise<void> {
    await this.page.reload();
  }

  async openBurgerMenu(): Promise<void> {
    await this.burgerMenuButton.click();
    await this.logoutLink.waitFor({ state: 'visible' });
  }

  async closeBurgerMenu(): Promise<void> {
    await this.closeMenuButton.click();
  }

  async logout(): Promise<void> {
    await this.openBurgerMenu();
    await this.logoutLink.click();
  }

  async resetAppState(): Promise<void> {
    await this.openBurgerMenu();
    await this.resetAppStateLink.click();
    await this.closeBurgerMenu();
  }

  async goToCart(): Promise<void> {
    await this.cartLink.click();
  }

  /** Number shown on the cart badge, or 0 when no badge is rendered. */
  async getCartItemCount(): Promise<number> {
    if (await this.cartBadge.isVisible().catch(() => false)) {
      const text = await this.cartBadge.innerText();
      return Number(text);
    }
    return 0;
  }

  async getErrorText(): Promise<string> {
    return this.errorMessage.innerText();
  }

  async isErrorVisible(): Promise<boolean> {
    return this.errorMessage.isVisible();
  }

  async dismissError(): Promise<void> {
    await this.errorCloseButton.click();
  }
}
