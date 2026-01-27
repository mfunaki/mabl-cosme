import { IMAGE_CONFIG, TIMING_CONFIG } from '../constants/config'

/** API応答の型 */
export interface AIGenerationResponse {
  status: number
  ok: boolean
  imageUrl?: string
  error?: string
}

/** 保存応答の型 */
export interface SaveResponse {
  status: number
  ok: boolean
  id: string
}

/**
 * 指定ミリ秒待機する
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * OpenAI DALL-E 3 APIを使用して背景画像を生成
 */
export async function generateBackgroundWithAI(
  prompt: string,
  apiBaseUrl: string,
  token?: string | null
): Promise<AIGenerationResponse> {
  try {
    console.log('Calling backend API to generate background with prompt:', prompt)
    console.log('API Base URL:', apiBaseUrl || '(same host)')

    // プロンプトに背景生成の指示を追加
    const enhancedPrompt = `Generate a background image that is: ${prompt}. The image should be suitable as a professional background. High quality, detailed.`

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // トークンがある場合はAuthorizationヘッダーを追加
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${apiBaseUrl}/api/openai`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: `${IMAGE_CONFIG.canvas.width}x${IMAGE_CONFIG.canvas.height}`,
        response_format: 'b64_json',
      }),
    })

    console.log('Response status:', response.status)
    console.log('Response ok:', response.ok)

    // レスポンスの内容をチェック
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      console.error('Non-JSON response:', text)
      throw new Error('Invalid response from server')
    }

    const data = await response.json()
    console.log('Response data received:', { hasData: !!data.data, hasError: !!data.error })

    if (!response.ok) {
      const errorMessage = data.error?.message || data.error || 'API request failed'
      throw new Error(errorMessage)
    }

    if (data.data && data.data[0]?.b64_json) {
      const imageUrl = `data:image/png;base64,${data.data[0].b64_json}`
      console.log('Image URL created, length:', imageUrl.length)
      return { status: 200, ok: true, imageUrl }
    }

    return { status: 500, ok: false, error: 'No image generated' }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'API Error'
    console.error('Backend API Error:', error)
    return {
      status: 500,
      ok: false,
      error: errorMessage,
    }
  }
}

/**
 * ギャラリーへの保存をシミュレート（モック）
 */
export async function mockSave(_dataUrl: string): Promise<SaveResponse> {
  await sleep(TIMING_CONFIG.mockSaveDelayMs)
  return {
    status: 200,
    ok: true,
    id: Math.random().toString(36).slice(2),
  }
}
