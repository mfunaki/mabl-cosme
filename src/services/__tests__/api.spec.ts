import { test, expect } from '@playwright/test'

test.describe('API - Mock Save', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('save button should be visible', async ({ page }) => {
    await expect(page.getByTestId('btn-save')).toBeVisible()
  })

  test('download button should be visible', async ({ page }) => {
    await expect(page.getByTestId('btn-download')).toBeVisible()
  })

  test('API payload should display response data', async ({ page }) => {
    const apiPayload = page.getByTestId('api-payload')
    await expect(apiPayload).toBeVisible()
  })
})

test.describe('API - AI Generation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should show AI prompt textarea', async ({ page }) => {
    const prompt = page.getByTestId('ai-prompt')
    await expect(prompt).toBeVisible()
  })

  test('AI prompt should have default Japanese value', async ({ page }) => {
    const prompt = page.getByTestId('ai-prompt')
    await expect(prompt).toHaveValue(/ハワイ/)
  })

  test('AI prompt should update when language changes', async ({ page }) => {
    // Switch to English
    await page.getByTestId('lang-select').selectOption('en')

    const prompt = page.getByTestId('ai-prompt')
    await expect(prompt).toHaveValue(/Hawaiian/)
  })

  test('should be able to modify AI prompt', async ({ page }) => {
    const prompt = page.getByTestId('ai-prompt')

    await prompt.fill('Custom background prompt')
    await expect(prompt).toHaveValue('Custom background prompt')
  })

  test('AI generate button should show unique ID', async ({ page }) => {
    const aiButton = page.getByTestId('btn-ai-generate')
    const buttonId = await aiButton.getAttribute('id')

    expect(buttonId).toMatch(/^btn-[a-z0-9]+$/)
  })

  test('API server selector should have two options', async ({ page }) => {
    const apiSelect = page.getByTestId('api-server-select')
    const options = apiSelect.locator('option')

    await expect(options).toHaveCount(2)
  })

  test('should be able to switch API server', async ({ page }) => {
    const apiSelect = page.getByTestId('api-server-select')

    await apiSelect.selectOption('cloud')
    await expect(apiSelect).toHaveValue('cloud')

    await apiSelect.selectOption('same')
    await expect(apiSelect).toHaveValue('same')
  })
})

test.describe('API - Network Mocking', () => {
  test('should handle API error gracefully', async ({ page }) => {
    // Mock the API to return an error
    await page.route('**/api/openai', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      })
    })

    await page.goto('/')

    // The app should still load and function
    await expect(page.getByTestId('app-title')).toBeVisible()
  })
})
