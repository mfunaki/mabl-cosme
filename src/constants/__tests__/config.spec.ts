import { test, expect } from '@playwright/test'

// Constants are tested indirectly through the app behavior
// This file contains smoke tests for config-related functionality

test.describe('Config - App Behavior Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load app with correct title (language config)', async ({ page }) => {
    // Tests LOCALES config - default should be Japanese
    await expect(page.getByTestId('app-title')).toContainText('ワークフロー')
  })

  test('should have language selector with 3 options (LOCALES config)', async ({ page }) => {
    const langSelect = page.getByTestId('lang-select')
    const options = langSelect.locator('option')
    await expect(options).toHaveCount(3)
  })

  test('should have API server selector (API_SERVERS config)', async ({ page }) => {
    const apiSelect = page.getByTestId('api-server-select')
    await expect(apiSelect).toBeVisible()

    // Check for 'same' and 'cloud' options
    const options = apiSelect.locator('option')
    await expect(options).toHaveCount(2)
  })

  test('sliders should have min=-100 and max=100 (SLIDER_CONFIG)', async ({ page }) => {
    const tempSlider = page.getByTestId('slider-temp')
    const satSlider = page.getByTestId('slider-sat')

    await expect(tempSlider).toHaveAttribute('min', '-100')
    await expect(tempSlider).toHaveAttribute('max', '100')
    await expect(satSlider).toHaveAttribute('min', '-100')
    await expect(satSlider).toHaveAttribute('max', '100')
  })

  test('file input should accept only images (IMAGE_CONFIG.allowedTypes)', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput).toHaveAttribute('accept', 'image/png,image/jpeg')
  })
})
