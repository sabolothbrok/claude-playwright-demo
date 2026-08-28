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
    this.burgerMenuButton = page.locator('#react-burger-menu-btn');
    this.closeMenuButton = page.locator('#react-burger-cross-btn');
    this.logoutLink = page.locator('#logout_sidebar_link');
    this.resetAppStateLink = page.locator('#reset_sidebar_link');
    this.allItemsLink = page.locator('#inventory_sidebar_link');
    this.aboutLink = page.locator('#about_sidebar_link');
    this.cartLink = page.locator('.shopping_cart_link');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.errorMessage = page.locator('[data-test="error"]');
    this.errorCloseButton = page.locator('.error-button');
  }

  /** Navigate directly to a path relative to baseURL. */
  async goto(path = '/'): Promise<void> {
    await this.page.goto(path);
  }

  /** Current page title as rendered in the DOM (not the browser tab title). */
  async getPageTitle(): Promise<string> {
    return this.page.locator('.title').innerText();
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
