import {
  IMAGE_CONFIG,
  COLOR_TEMP_CONFIG,
  SATURATION_CONFIG,
} from '../constants/config'

/**
 * 数値を指定範囲内に制限する
 */
export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

/**
 * 画像に色調補正（色温度・彩度）を適用してCanvas経由でData URLを生成
 */
export function bakeToCanvas(
  img: HTMLImageElement,
  colorTemp: number,
  saturation: number
): string {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const { maxWidth, maxHeight } = IMAGE_CONFIG.preview

  let { width, height } = img
  const scale = Math.min(1, maxWidth / width, maxHeight / height)
  width = Math.floor(width * scale)
  height = Math.floor(height * scale)

  canvas.width = width
  canvas.height = height
  ctx.drawImage(img, 0, 0, width, height)

  // 色温度補正（暖色オーバーレイ）
  const warmth = (colorTemp + COLOR_TEMP_CONFIG.offset) / COLOR_TEMP_CONFIG.divisor
  if (warmth > 0) {
    ctx.fillStyle = `${COLOR_TEMP_CONFIG.warmColor}${COLOR_TEMP_CONFIG.warmCoefficient * warmth})`
    ctx.fillRect(0, 0, width, height)
  }

  // 彩度補正
  if (saturation !== 0) {
    const mag = Math.abs(saturation) / SATURATION_CONFIG.divisor
    ctx.fillStyle = saturation > 0
      ? `rgba(255,255,255,${SATURATION_CONFIG.coefficient * mag})`
      : `rgba(0,0,0,${SATURATION_CONFIG.coefficient * mag})`
    ctx.fillRect(0, 0, width, height)
  }

  return canvas.toDataURL('image/png')
}

/**
 * AI生成背景と元画像を合成する
 */
export async function composeBackgroundWithImage(
  backgroundBase64: string,
  originalFile: File
): Promise<string> {
  const { width: canvasWidth, height: canvasHeight } = IMAGE_CONFIG.canvas

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    // 背景画像を読み込む
    const bgImg = new Image()
    bgImg.onload = () => {
      // キャンバスを背景と同じサイズに設定
      canvas.width = canvasWidth
      canvas.height = canvasHeight

      // 背景を描画
      ctx.drawImage(bgImg, 0, 0, canvasWidth, canvasHeight)

      // 元の画像を読み込んで合成
      const originalImg = new Image()
      originalImg.onload = () => {
        // 元の画像を中央に配置してリサイズ
        let width = originalImg.width
        let height = originalImg.height

        const scale = Math.min(canvasWidth / width, canvasHeight / height)
        width = Math.floor(width * scale)
        height = Math.floor(height * scale)

        const x = (canvasWidth - width) / 2
        const y = (canvasHeight - height) / 2

        // 元の画像を背景の上に描画
        ctx.drawImage(originalImg, x, y, width, height)

        // 合成画像をBase64に変換
        canvas.toBlob((blob) => {
          if (blob) {
            const reader = new FileReader()
            reader.onload = () => {
              resolve(reader.result as string)
            }
            reader.readAsDataURL(blob)
          } else {
            reject(new Error('Failed to compose images'))
          }
        }, 'image/png')
      }
      originalImg.onerror = reject
      originalImg.src = URL.createObjectURL(originalFile)
    }
    bgImg.onerror = reject
    bgImg.src = backgroundBase64
  })
}
