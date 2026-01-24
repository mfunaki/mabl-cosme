import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { IMAGE_CONFIG, SLIDER_CONFIG, TIMING_CONFIG, API_SERVERS, type ApiServerId } from '../constants/config'
import { useTranslation } from '../contexts/LanguageContext'
import { generateBackgroundWithAI, mockSave } from '../services/api'
import { bakeToCanvas, composeBackgroundWithImage, clamp } from '../utils/imageProcessor'
import type { GalleryItem } from './Gallery'

interface ImageEditorProps {
  apiServerId: ApiServerId
  onSave: (item: GalleryItem) => void
}

export interface ImageEditorRef {
  lastApi: unknown
}

export const ImageEditor = forwardRef<ImageEditorRef, ImageEditorProps>(
  function ImageEditor({ apiServerId, onSave }, ref) {
    const { t } = useTranslation()

    const [file, setFile] = useState<File | null>(null)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const [imgUrl, setImgUrl] = useState<string | null>(null)
    const [processedImgUrl, setProcessedImgUrl] = useState<string | null>(null)
    const [aiBusy, setAiBusy] = useState(false)
    const [aiButtonId] = useState(() => 'btn-' + Math.random().toString(36).substring(2, 7))
    const [aiError, setAiError] = useState<string | null>(null)
    const [lastApi, setLastApi] = useState<unknown>(null)
    const [colorTemp, setColorTemp] = useState(0)
    const [saturation, setSaturation] = useState(0)
    const [aiPrompt, setAiPrompt] = useState(t.defaultPrompt)

    const imgEl = useRef<HTMLImageElement>(null)
    const originalImgEl = useRef<HTMLImageElement>(null)

    // Expose lastApi to parent via ref
    useImperativeHandle(ref, () => ({ lastApi }), [lastApi])

    // 言語切り替え時にデフォルトプロンプトを更新
    useEffect(() => {
      setAiPrompt(t.defaultPrompt)
    }, [t.defaultPrompt])

    // ファイル変更時の処理
    useEffect(() => {
      if (!file) {
        setImgUrl(null)
        setProcessedImgUrl(null)
        return
      }
      const u = URL.createObjectURL(file)
      setImgUrl(u)
      setProcessedImgUrl(null)
      setColorTemp(0)
      setSaturation(0)
      return () => URL.revokeObjectURL(u)
    }, [file])

    // 色調補正の値が変更されたら実際の画像を生成
    useEffect(() => {
      if (!originalImgEl.current || !imgUrl) return

      const timeoutId = setTimeout(() => {
        const baked = bakeToCanvas(originalImgEl.current!, colorTemp, saturation)
        setProcessedImgUrl(baked)
      }, TIMING_CONFIG.debounceMs)

      return () => clearTimeout(timeoutId)
    }, [colorTemp, saturation, imgUrl])

    function onDrop(e: React.DragEvent) {
      e.preventDefault()
      const f = e.dataTransfer.files?.[0]
      if (f) handleFile(f)
    }

    function handleFile(f: File | null) {
      if (!f) return
      setUploadError(null)
      const okType = IMAGE_CONFIG.allowedTypes.test(f.type)
      const okSize = f.size <= IMAGE_CONFIG.maxFileSize
      if (!okType) return setUploadError('Only JPG/PNG supported')
      if (!okSize) return setUploadError('Max 10MB')
      setFile(f)
    }

    async function aiGenerate() {
      if (!file || !imgEl.current) return alert(t.needImage)

      setAiBusy(true)
      setAiError(null)

      try {
        const apiServer = API_SERVERS.find((s) => s.id === apiServerId)
        const resp = await generateBackgroundWithAI(aiPrompt, apiServer?.url || '')

        if (resp.ok && resp.imageUrl) {
          console.log('Composing background with original image...')
          const composedImageUrl = await composeBackgroundWithImage(resp.imageUrl, file)
          console.log('Image composition complete')

          if (imgUrl && imgUrl.startsWith('blob:')) {
            URL.revokeObjectURL(imgUrl)
          }

          setImgUrl(composedImageUrl)
          setProcessedImgUrl(null)
          setColorTemp(0)
          setSaturation(0)
          setLastApi({
            ...resp,
            message: 'AI background generated and composed',
          })
        } else {
          setAiError(resp.error || 'Failed to generate background')
          setLastApi(resp)
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        setAiError(errorMessage)
        setLastApi({ status: 500, ok: false, error: errorMessage })
      } finally {
        setAiBusy(false)
      }
    }

    function applyAdjust() {
      setLastApi((p: unknown) => ({
        ...(typeof p === 'object' && p !== null ? p : {}),
        filterApplied: true,
        message: 'applied',
      }))
    }

    async function saveToGallery() {
      if (!processedImgUrl && !imgUrl) return alert(t.needImage)
      const dataUrl = processedImgUrl || imgUrl!
      const resp = await mockSave(dataUrl)
      setLastApi(resp)
      if (resp.ok) {
        onSave({
          id: resp.id,
          dataUrl,
          createdAt: new Date().toISOString(),
        })
      }
    }

    function downloadCurrent() {
      if (!processedImgUrl && !imgUrl) return alert(t.needImage)
      const dataUrl = processedImgUrl || imgUrl!
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `mabl-cosme-demo-${Date.now()}.png`
      a.click()
    }

    return (
      <section className="bg-white rounded-2xl shadow p-4 md:p-6">
        <h2 className="text-lg font-medium mb-3">Upload</h2>
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed rounded-2xl p-6 flex flex-col md:flex-row gap-4 items-center justify-center"
        >
          <label
            className="cursor-pointer border rounded-xl px-4 py-2"
            htmlFor="file-input"
            data-testid="btn-upload"
          >
            {t.upload}
          </label>
          <input
            id="file-input"
            type="file"
            className="hidden"
            accept="image/png,image/jpeg"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          <span className="opacity-70 text-sm">{t.orDrop}</span>
          {uploadError && (
            <span className="text-red-600 text-sm" data-testid="upload-error">
              {uploadError}
            </span>
          )}
        </div>

        {/* 元画像を非表示で保持 */}
        {imgUrl && (
          <img
            ref={originalImgEl}
            src={imgUrl}
            alt="original"
            className="hidden"
            onLoad={() => setLastApi({ ok: true, message: 'image-loaded' })}
          />
        )}

        <div className="mt-4 grid md:grid-cols-2 gap-6">
          <div className="aspect-square bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden">
            {processedImgUrl || imgUrl ? (
              <img
                data-testid="img-preview"
                ref={imgEl}
                src={processedImgUrl || imgUrl!}
                alt="preview"
                className="object-contain w-full h-full"
              />
            ) : (
              <span className="opacity-50">No image</span>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm block mb-2" htmlFor="ai-prompt">
                {t.promptLabel}
              </label>
              <textarea
                id="ai-prompt"
                data-testid="ai-prompt"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder={t.defaultPrompt}
                className="w-full border rounded-xl px-3 py-2 text-sm mb-3"
                rows={2}
              />
              <button
                id={aiButtonId}
                data-testid="btn-ai-generate"
                onClick={aiGenerate}
                disabled={!imgUrl || aiBusy}
                className="rounded-xl px-4 py-2 border disabled:opacity-50"
              >
                {aiBusy ? t.generating : t.aiGenerate}
              </button>
              <span className="ml-2 text-xs text-gray-500">{aiButtonId}</span>
              {aiError && (
                <p className="text-red-600 text-sm mt-2" data-testid="ai-error">
                  {aiError}
                </p>
              )}
            </div>

            <div className="bg-slate-50 rounded-2xl p-4">
              <h3 className="font-medium mb-3">{t.adjust}</h3>
              <div className="grid grid-cols-5 gap-3 items-center">
                <label className="text-sm col-span-2" htmlFor="temp">
                  {t.colorTemp}: {colorTemp}
                </label>
                <input
                  id="temp"
                  data-testid="slider-temp"
                  type="range"
                  min={SLIDER_CONFIG.min}
                  max={SLIDER_CONFIG.max}
                  value={colorTemp}
                  onChange={(e) =>
                    setColorTemp(clamp(parseInt(e.target.value), SLIDER_CONFIG.min, SLIDER_CONFIG.max))
                  }
                  className="col-span-3"
                />
                <label className="text-sm col-span-2" htmlFor="sat">
                  {t.saturation}: {saturation}
                </label>
                <input
                  id="sat"
                  data-testid="slider-sat"
                  type="range"
                  min={SLIDER_CONFIG.min}
                  max={SLIDER_CONFIG.max}
                  value={saturation}
                  onChange={(e) =>
                    setSaturation(clamp(parseInt(e.target.value), SLIDER_CONFIG.min, SLIDER_CONFIG.max))
                  }
                  className="col-span-3"
                />
              </div>
              <button
                data-testid="btn-apply"
                onClick={applyAdjust}
                className="mt-3 rounded-xl px-4 py-2 border"
              >
                {t.apply}
              </button>
            </div>

            <div className="flex gap-3">
              <button
                data-testid="btn-save"
                onClick={saveToGallery}
                className="rounded-xl px-4 py-2 border"
              >
                {t.save}
              </button>
              <button
                data-testid="btn-download"
                onClick={downloadCurrent}
                className="rounded-xl px-4 py-2 border"
              >
                {t.download}
              </button>
            </div>

            <pre
              data-testid="api-payload"
              className="text-xs bg-slate-100 rounded-xl p-3 overflow-auto max-h-40"
            >
              {JSON.stringify(lastApi, null, 2)}
            </pre>
          </div>
        </div>
      </section>
    )
  }
)
