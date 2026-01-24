import { test, expect } from '@playwright/test'

test.describe('LanguageContext - Provider Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should provide Japanese as default locale', async ({ page }) => {
    const langSelect = page.getByTestId('lang-select')
    await expect(langSelect).toHaveValue('ja')
  })

  test('should provide translations to all components', async ({ page }) => {
    // Multiple components should have translated text
    await expect(page.getByTestId('app-title')).toContainText('ワークフロー')
    await expect(page.getByTestId('btn-login')).toContainText('ログイン')
    await expect(page.getByTestId('btn-upload')).toContainText('アップロード')
    await expect(page.getByTestId('btn-ai-generate')).toContainText('AI')
  })

  test('should update all components when locale changes', async ({ page }) => {
    // Switch to English
    await page.getByTestId('lang-select').selectOption('en')

    // All components should update
    await expect(page.getByTestId('app-title')).toContainText('Workflow')
    await expect(page.getByTestId('btn-login')).toContainText('Log In')
    await expect(page.getByTestId('btn-upload')).toContainText('Upload')
    await expect(page.getByTestId('btn-ai-generate')).toContainText('Generate')
  })

  test('should support all three languages', async ({ page }) => {
    const langSelect = page.getByTestId('lang-select')

    // Japanese (default)
    await expect(langSelect).toHaveValue('ja')

    // Switch to English
    await langSelect.selectOption('en')
    await expect(langSelect).toHaveValue('en')

    // Switch to Chinese
    await langSelect.selectOption('zh')
    await expect(langSelect).toHaveValue('zh')

    // Switch back to Japanese
    await langSelect.selectOption('ja')
    await expect(langSelect).toHaveValue('ja')
  })
})
