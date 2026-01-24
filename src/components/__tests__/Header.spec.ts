import { test, expect } from '@playwright/test'

test.describe('Header Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should render app title', async ({ page }) => {
    await expect(page.getByTestId('app-title')).toBeVisible()
    await expect(page.getByTestId('app-title')).toContainText('ワークフロー')
  })

  test('should render environment selector', async ({ page }) => {
    const envSelect = page.getByTestId('env-select')
    await expect(envSelect).toBeVisible()
    await expect(envSelect).toHaveValue('staging')
  })

  test('should render language selector', async ({ page }) => {
    const langSelect = page.getByTestId('lang-select')
    await expect(langSelect).toBeVisible()
    await expect(langSelect).toHaveValue('ja')
  })

  test('should render API server selector', async ({ page }) => {
    const apiSelect = page.getByTestId('api-server-select')
    await expect(apiSelect).toBeVisible()
    await expect(apiSelect).toHaveValue('same')
  })

  test('should switch environment', async ({ page }) => {
    const envSelect = page.getByTestId('env-select')

    await envSelect.selectOption('production')
    await expect(envSelect).toHaveValue('production')

    await envSelect.selectOption('staging')
    await expect(envSelect).toHaveValue('staging')
  })

  test('should switch language and update title', async ({ page }) => {
    const langSelect = page.getByTestId('lang-select')

    // Switch to English
    await langSelect.selectOption('en')
    await expect(page.getByTestId('app-title')).toContainText('Workflow')

    // Switch to Chinese
    await langSelect.selectOption('zh')
    await expect(page.getByTestId('app-title')).toContainText('工作流')

    // Switch back to Japanese
    await langSelect.selectOption('ja')
    await expect(page.getByTestId('app-title')).toContainText('ワークフロー')
  })

  test('should switch API server', async ({ page }) => {
    const apiSelect = page.getByTestId('api-server-select')

    await apiSelect.selectOption('cloud')
    await expect(apiSelect).toHaveValue('cloud')

    await apiSelect.selectOption('same')
    await expect(apiSelect).toHaveValue('same')
  })

  test('environment options should have correct values', async ({ page }) => {
    const envSelect = page.getByTestId('env-select')
    const options = envSelect.locator('option')

    await expect(options).toHaveCount(2)
    await expect(options.first()).toHaveAttribute('value', 'staging')
    await expect(options.last()).toHaveAttribute('value', 'production')
  })
})
