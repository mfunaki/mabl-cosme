import { test, expect } from '@playwright/test'

test.describe('ImageEditor Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should render upload button', async ({ page }) => {
    await expect(page.getByTestId('btn-upload')).toBeVisible()
  })

  test('should render AI generate button', async ({ page }) => {
    await expect(page.getByTestId('btn-ai-generate')).toBeVisible()
  })

  test('AI generate button should be disabled without image', async ({ page }) => {
    await expect(page.getByTestId('btn-ai-generate')).toBeDisabled()
  })

  test('should render color adjustment sliders', async ({ page }) => {
    await expect(page.getByTestId('slider-temp')).toBeVisible()
    await expect(page.getByTestId('slider-sat')).toBeVisible()
  })

  test('should render apply button', async ({ page }) => {
    await expect(page.getByTestId('btn-apply')).toBeVisible()
  })

  test('should render AI prompt textarea', async ({ page }) => {
    await expect(page.getByTestId('ai-prompt')).toBeVisible()
  })

  test('should show "No image" placeholder', async ({ page }) => {
    await expect(page.locator('text=No image')).toBeVisible()
  })

  test('sliders should start at 0', async ({ page }) => {
    await expect(page.getByTestId('slider-temp')).toHaveValue('0')
    await expect(page.getByTestId('slider-sat')).toHaveValue('0')
  })

  test('should be able to adjust sliders', async ({ page }) => {
    const tempSlider = page.getByTestId('slider-temp')
    const satSlider = page.getByTestId('slider-sat')

    await tempSlider.fill('50')
    await expect(tempSlider).toHaveValue('50')

    await satSlider.fill('-30')
    await expect(satSlider).toHaveValue('-30')
  })

  test('AI prompt should have default value', async ({ page }) => {
    const prompt = page.getByTestId('ai-prompt')
    await expect(prompt).toHaveValue(/ハワイ/)
  })

  test('should be able to edit AI prompt', async ({ page }) => {
    const prompt = page.getByTestId('ai-prompt')
    await prompt.fill('Mountain landscape')
    await expect(prompt).toHaveValue('Mountain landscape')
  })

  test('file input should accept only images', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput).toHaveAttribute('accept', 'image/png,image/jpeg')
  })

  test('should display unique AI button ID', async ({ page }) => {
    const aiButton = page.getByTestId('btn-ai-generate')
    const buttonId = await aiButton.getAttribute('id')
    expect(buttonId).toMatch(/^btn-[a-z0-9]+$/)
  })

  test('apply button should update API payload', async ({ page }) => {
    await page.getByTestId('btn-apply').click()

    const apiPayload = page.getByTestId('api-payload')
    await expect(apiPayload).toContainText('filterApplied')
  })

  test('upload button text should translate', async ({ page }) => {
    // Japanese
    await expect(page.getByTestId('btn-upload')).toContainText('画像をアップロード')

    // Switch to English
    await page.getByTestId('lang-select').selectOption('en')
    await expect(page.getByTestId('btn-upload')).toContainText('Upload Image')
  })

  test('AI generate button text should translate', async ({ page }) => {
    // Japanese
    await expect(page.getByTestId('btn-ai-generate')).toContainText('背景をAIで生成')

    // Switch to English
    await page.getByTestId('lang-select').selectOption('en')
    await expect(page.getByTestId('btn-ai-generate')).toContainText('Generate Background')
  })

  test('color adjustment labels should translate', async ({ page }) => {
    // Japanese labels
    await expect(page.locator('label:has-text("色温度")')).toBeVisible()
    await expect(page.locator('label:has-text("彩度")')).toBeVisible()

    // Switch to English
    await page.getByTestId('lang-select').selectOption('en')
    await expect(page.locator('label:has-text("Color Temp")')).toBeVisible()
    await expect(page.locator('label:has-text("Saturation")')).toBeVisible()
  })
})
