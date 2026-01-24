import { test, expect } from '@playwright/test'

test.describe('AuthSection Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should render login form when not logged in', async ({ page }) => {
    await expect(page.getByTestId('email')).toBeVisible()
    await expect(page.getByTestId('password')).toBeVisible()
    await expect(page.getByTestId('btn-login')).toBeVisible()
  })

  test('email input should have correct placeholder', async ({ page }) => {
    await expect(page.getByTestId('email')).toHaveAttribute('placeholder', 'user@example.com')
  })

  test('password input should be of type password', async ({ page }) => {
    await expect(page.getByTestId('password')).toHaveAttribute('type', 'password')
  })

  test('should login with valid credentials', async ({ page }) => {
    await page.getByTestId('email').fill('test@example.com')
    await page.getByTestId('password').fill('password123')
    await page.getByTestId('btn-login').click()

    // After login, should show logged in state
    await expect(page.getByTestId('login-state')).toBeVisible()
    await expect(page.getByTestId('login-state')).toHaveText('Logged in')

    // Login form should be hidden
    await expect(page.getByTestId('email')).not.toBeVisible()
    await expect(page.getByTestId('password')).not.toBeVisible()
    await expect(page.getByTestId('btn-login')).not.toBeVisible()
  })

  test('should show logout button when logged in', async ({ page }) => {
    // Login first
    await page.getByTestId('email').fill('test@example.com')
    await page.getByTestId('password').fill('password123')
    await page.getByTestId('btn-login').click()

    // Logout button should be visible
    await expect(page.getByTestId('btn-logout')).toBeVisible()
  })

  test('should logout when logout button clicked', async ({ page }) => {
    // Login first
    await page.getByTestId('email').fill('test@example.com')
    await page.getByTestId('password').fill('password123')
    await page.getByTestId('btn-login').click()

    // Click logout
    await page.getByTestId('btn-logout').click()

    // Should show login form again
    await expect(page.getByTestId('email')).toBeVisible()
    await expect(page.getByTestId('password')).toBeVisible()
    await expect(page.getByTestId('btn-login')).toBeVisible()
    await expect(page.getByTestId('login-state')).not.toBeVisible()
  })

  test('should not login with empty email', async ({ page }) => {
    await page.getByTestId('password').fill('password123')
    await page.getByTestId('btn-login').click()

    // Should still show login form
    await expect(page.getByTestId('email')).toBeVisible()
    await expect(page.getByTestId('login-state')).not.toBeVisible()
  })

  test('should not login with empty password', async ({ page }) => {
    await page.getByTestId('email').fill('test@example.com')
    await page.getByTestId('btn-login').click()

    // Should still show login form
    await expect(page.getByTestId('password')).toBeVisible()
    await expect(page.getByTestId('login-state')).not.toBeVisible()
  })

  test('login button text should translate', async ({ page }) => {
    // Default Japanese
    await expect(page.getByTestId('btn-login')).toContainText('ログイン')

    // Switch to English
    await page.getByTestId('lang-select').selectOption('en')
    await expect(page.getByTestId('btn-login')).toContainText('Log In')
  })
})
