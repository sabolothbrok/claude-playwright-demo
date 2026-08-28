import { test, expect } from '@fixtures/pages.fixture';
import { users } from '@data/users';

test.describe('Login', () => {
  test('standard user can log in successfully @smoke', async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.expectLoaded();
    await expect(inventoryPage.page).toHaveURL(/inventory\.html/);
  });

  test('locked out user sees a lockout error @regression', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(users.lockedOut.username, users.lockedOut.password);
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Sorry, this user has been locked out');
  });

  test('invalid password shows a generic error @regression', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(users.standard.username, 'wrong_password');
    await expect(loginPage.errorMessage).toContainText(
      'Username and password do not match any user in this service',
    );
  });

  test('empty credentials show a required-field error @regression', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.loginButton.click();
    await expect(loginPage.errorMessage).toContainText('Username is required');
  });

  test('missing password shows a required-field error @regression', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.usernameInput.fill(users.standard.username);
    await loginPage.loginButton.click();
    await expect(loginPage.errorMessage).toContainText('Password is required');
  });

  test('error banner can be dismissed @regression', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.loginButton.click();
    await expect(loginPage.errorMessage).toBeVisible();
    await loginPage.errorCloseButton.click();
    await expect(loginPage.errorMessage).toBeHidden();
  });

  test('logout returns to the login page @regression', async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.expectLoaded();
    await inventoryPage.logout();
    await loginPage.expectLoaded();
    await expect(loginPage.page).toHaveURL('https://www.saucedemo.com/');
  });
});
