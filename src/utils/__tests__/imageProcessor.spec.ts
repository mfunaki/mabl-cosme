import { test, expect } from '@playwright/test'

test.describe('Image Processing - Color Adjustment', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('sliders should start at 0', async ({ page }) => {
    const tempSlider = page.getByTestId('slider-temp')
    const satSlider = page.getByTestId('slider-sat')

    await expect(tempSlider).toHaveValue('0')
    await expect(satSlider).toHaveValue('0')
  })

  test('should be able to change color temperature', async ({ page }) => {
    const tempSlider = page.getByTestId('slider-temp')

    await tempSlider.fill('50')
    await expect(tempSlider).toHaveValue('50')

    await tempSlider.fill('-50')
    await expect(tempSlider).toHaveValue('-50')
  })

  test('should be able to change saturation', async ({ page }) => {
    const satSlider = page.getByTestId('slider-sat')

    await satSlider.fill('75')
    await expect(satSlider).toHaveValue('75')

    await satSlider.fill('-75')
    await expect(satSlider).toHaveValue('-75')
  })

  test('sliders should clamp to min/max values', async ({ page }) => {
    const tempSlider = page.getByTestId('slider-temp')

    // HTML range inputs automatically clamp, but let's verify the attributes
    await expect(tempSlider).toHaveAttribute('min', '-100')
    await expect(tempSlider).toHaveAttribute('max', '100')
  })

  test('apply button should update API payload', async ({ page }) => {
    // Click apply
    await page.getByTestId('btn-apply').click()

    // Check API payload shows the applied status
    const apiPayload = page.getByTestId('api-payload')
    await expect(apiPayload).toContainText('filterApplied')
    await expect(apiPayload).toContainText('applied')
  })
})

test.describe('Image Processing - File Upload', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should show "No image" initially', async ({ page }) => {
    await expect(page.locator('text=No image')).toBeVisible()
  })

  test('AI generate button should be disabled without image', async ({ page }) => {
    const aiButton = page.getByTestId('btn-ai-generate')
    await expect(aiButton).toBeDisabled()
  })

  test('file input should only accept images', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput).toHaveAttribute('accept', 'image/png,image/jpeg')
  })
})
