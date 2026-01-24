import { test, expect } from '@playwright/test'

test.describe('Gallery Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should show empty state initially', async ({ page }) => {
    // Gallery should show dash for empty state
    const gallery = page.locator('section').filter({ hasText: /ギャラリー|Gallery/ })
    await expect(gallery.locator('text=—')).toBeVisible()
  })

  test('gallery title should be visible', async ({ page }) => {
    // Japanese title
    await expect(page.locator('h2:has-text("ギャラリー")')).toBeVisible()
  })

  test('gallery title should translate', async ({ page }) => {
    // Switch to English
    await page.getByTestId('lang-select').selectOption('en')
    await expect(page.locator('h2:has-text("Gallery")')).toBeVisible()

    // Switch to Chinese
    await page.getByTestId('lang-select').selectOption('zh')
    await expect(page.locator('h2:has-text("图库")')).toBeVisible()
  })

  test('save button should be available', async ({ page }) => {
    await expect(page.getByTestId('btn-save')).toBeVisible()
  })

  test('download button should be available', async ({ page }) => {
    await expect(page.getByTestId('btn-download')).toBeVisible()
  })

  test('save and download buttons should translate', async ({ page }) => {
    // Japanese
    await expect(page.getByTestId('btn-save')).toContainText('保存')
    await expect(page.getByTestId('btn-download')).toContainText('ダウンロード')

    // Switch to English
    await page.getByTestId('lang-select').selectOption('en')
    await expect(page.getByTestId('btn-save')).toContainText('Save')
    await expect(page.getByTestId('btn-download')).toContainText('Download')
  })
})
