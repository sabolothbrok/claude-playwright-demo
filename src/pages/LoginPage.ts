import { Locator, Page, expect } from '@playwright/test';

/**
 * Page Object for https://www.saucedemo.com/ (the login screen).
 * This is the only page in the app reachable while unauthenticated.
 */
export class LoginPage {
  readonly page: Page;

  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly errorCloseButton: Locator;
  readonly logo: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('#user-name');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('#login-button');
    this.errorMessage = page.locator('[data-test="error"]');
    this.errorCloseButton = page.locator('.error-button');
    this.logo = page.locator('.login_logo');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getErrorText(): Promise<string> {
    return this.errorMessage.innerText();
  }

  async isErrorVisible(): Promise<boolean> {
    return this.errorMessage.isVisible();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.logo).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }
}
