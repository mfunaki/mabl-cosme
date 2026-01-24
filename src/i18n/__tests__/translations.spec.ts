import { test, expect } from '@playwright/test'

test.describe('Translations - Language Switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display Japanese translations by default', async ({ page }) => {
    await expect(page.getByTestId('app-title')).toContainText('AIビジュアル制作ワークフロー')
    await expect(page.getByTestId('btn-login')).toContainText('ログイン')
    await expect(page.getByTestId('btn-upload')).toContainText('画像をアップロード')
  })

  test('should switch to English translations', async ({ page }) => {
    await page.getByTestId('lang-select').selectOption('en')

    await expect(page.getByTestId('app-title')).toContainText('AI Visual Creation Workflow')
    await expect(page.getByTestId('btn-login')).toContainText('Log In')
    await expect(page.getByTestId('btn-upload')).toContainText('Upload Image')
  })

  test('should switch to Chinese translations', async ({ page }) => {
    await page.getByTestId('lang-select').selectOption('zh')

    await expect(page.getByTestId('app-title')).toContainText('AI 视觉生成工作流')
    await expect(page.getByTestId('btn-login')).toContainText('登录')
    await expect(page.getByTestId('btn-upload')).toContainText('上传图片')
  })

  test('should persist language when switching back', async ({ page }) => {
    // Switch to English
    await page.getByTestId('lang-select').selectOption('en')
    await expect(page.getByTestId('app-title')).toContainText('Workflow')

    // Switch back to Japanese
    await page.getByTestId('lang-select').selectOption('ja')
    await expect(page.getByTestId('app-title')).toContainText('ワークフロー')
  })

  test('should translate all main UI elements', async ({ page }) => {
    // Test Japanese (default)
    await expect(page.getByTestId('btn-ai-generate')).toContainText('背景をAIで生成')
    await expect(page.getByTestId('btn-apply')).toContainText('適用')
    await expect(page.getByTestId('btn-save')).toContainText('保存')
    await expect(page.getByTestId('btn-download')).toContainText('ダウンロード')

    // Switch to English and verify
    await page.getByTestId('lang-select').selectOption('en')
    await expect(page.getByTestId('btn-ai-generate')).toContainText('Generate Background')
    await expect(page.getByTestId('btn-apply')).toContainText('Apply')
    await expect(page.getByTestId('btn-save')).toContainText('Save')
    await expect(page.getByTestId('btn-download')).toContainText('Download')
  })

  test('should translate API server labels', async ({ page }) => {
    const apiSelect = page.getByTestId('api-server-select')

    // Japanese labels
    await expect(apiSelect.locator('option').first()).toContainText('同一ホスト')

    // Switch to English
    await page.getByTestId('lang-select').selectOption('en')
    await expect(apiSelect.locator('option').first()).toContainText('Same Host')
  })
})
