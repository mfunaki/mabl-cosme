import React, { useEffect, useRef, useState } from 'react'

/**
 * mabl-cosme Demo (React)
 * - Backend proxy for OpenAI API
 * - Tailwind classes via CDN
 * - Elements instrumented with data-testid for mabl
 */

const LOCALES = ["ja", "en", "zh"] as const
type Locale = typeof LOCALES[number]

const T: Record<Locale, Record<string, string>> = {
  ja: {
    appTitle: "AIビジュアル制作ワークフロー(デモ)",
    env: "環境",
    login: "ログイン",
    logout: "ログアウト",
    email: "メールアドレス",
    password: "パスワード",
    upload: "画像をアップロード",
    orDrop: "または ここにドロップ",
    aiGenerate: "背景をAIで生成",
    adjust: "色調補正",
    colorTemp: "色温度",
    saturation: "彩度",
    apply: "適用",
    save: "保存",
    download: "ダウンロード",
    gallery: "ギャラリー",
    language: "言語",
    generating: "生成中...",
    applied: "適用しました",
    saved: "保存しました",
    needImage: "先に画像をアップロードしてください",
    promptLabel: "背景生成プロンプト",
    defaultPrompt: "ハワイの海岸の背景",
  },
  en: {
    appTitle: "AI Visual Creation Workflow (Demo)",
    env: "Environment",
    login: "Log In",
    logout: "Log Out",
    email: "Email",
    password: "Password",
    upload: "Upload Image",
    orDrop: "or drop here",
    aiGenerate: "Generate Background (AI)",
    adjust: "Adjust Colors",
    colorTemp: "Color Temp",
    saturation: "Saturation",
    apply: "Apply",
    save: "Save",
    download: "Download",
    gallery: "Gallery",
    language: "Language",
    generating: "Generating...",
    applied: "Applied",
    saved: "Saved",
    needImage: "Please upload an image first",
    promptLabel: "Background Generation Prompt",
    defaultPrompt: "Hawaiian beach background",
  },
  zh: {
    appTitle: "AI 视觉生成工作流(演示)",
    env: "环境",
    login: "登录",
    logout: "登出",
    email: "邮箱",
    password: "密码",
    upload: "上传图片",
    orDrop: "或拖拽到此",
    aiGenerate: "AI 生成背景",
    adjust: "色彩调整",
    colorTemp: "色温",
    saturation: "饱和度",
    apply: "应用",
    save: "保存",
    download: "下载",
    gallery: "图库",
    language: "语言",
    generating: "生成中...",
    applied: "已应用",
    saved: "已保存",
    needImage: "请先上传图片",
    promptLabel: "背景生成提示",
    defaultPrompt: "夏威夷海滩背景",
  },
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function generateBackgroundWithAI(prompt: string): Promise<{ status: number; ok: boolean; imageUrl?: string; error?: string }> {
  try {
    console.log('Calling backend API to generate background with prompt:', prompt)
    
    // プロンプトに背景生成の指示を追加
    const enhancedPrompt = `Generate a background image that is: ${prompt}. The image should be suitable as a professional background. High quality, detailed.`
    
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json"
      })
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
  } catch (error: any) {
    console.error('Backend API Error:', error)
    return { 
      status: 500, 
      ok: false, 
      error: error.message || 'API Error'
    }
  }
}

async function mockSave(_dataUrl: string) {
  await sleep(300)
  return { status: 200, ok: true, id: Math.random().toString(36).slice(2) } as const
}

function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)) }

function bakeToCanvas(img: HTMLImageElement, colorTemp: number, saturation: number): string {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const maxW = 1280, maxH = 1280
  let { width, height } = img
  const scale = Math.min(1, maxW / width, maxH / height)
  width = Math.floor(width * scale)
  height = Math.floor(height * scale)
  canvas.width = width
  canvas.height = height
  ctx.drawImage(img, 0, 0, width, height)
  const warmth = (colorTemp + 100) / 200
  if (warmth > 0) { ctx.fillStyle = `rgba(255,200,100,${0.08 * warmth})`; ctx.fillRect(0,0,width,height) }
  if (saturation !== 0) {
    const mag = Math.abs(saturation) / 100
    ctx.fillStyle = saturation > 0 ? `rgba(255,255,255,${0.05 * mag})` : `rgba(0,0,0,${0.05 * mag})`
    ctx.fillRect(0,0,width,height)
  }
  return canvas.toDataURL('image/png')
}

async function composeBackgroundWithImage(backgroundBase64: string, originalFile: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    
    // 背景画像を読み込む
    const bgImg = new Image()
    bgImg.onload = () => {
      // キャンバスを背景と同じサイズに設定
      canvas.width = 1024
      canvas.height = 1024
      
      // 背景を描画
      ctx.drawImage(bgImg, 0, 0, 1024, 1024)
      
      // 元の画像を読み込んで合成
      const originalImg = new Image()
      originalImg.onload = () => {
        // 元の画像を中央に配置してリサイズ
        const maxW = 1024, maxH = 1024
        let width = originalImg.width
        let height = originalImg.height
        
        const scale = Math.min(maxW / width, maxH / height)
        width = Math.floor(width * scale)
        height = Math.floor(height * scale)
        
        const x = (1024 - width) / 2
        const y = (1024 - height) / 2
        
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

export default function App() {
  const [locale, setLocale] = useState<Locale>('ja')
  const t = T[locale]
  
  const [aiPrompt, setAiPrompt] = useState(t.defaultPrompt)

  // 言語切り替え時にデフォルトプロンプトを更新
  useEffect(() => {
    setAiPrompt(T[locale].defaultPrompt)
  }, [locale])

  const [env, setEnv] = useState<'staging'|'production'>('staging')
  const [loggedIn, setLoggedIn] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const passRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [imgUrl, setImgUrl] = useState<string | null>(null)
  const [processedImgUrl, setProcessedImgUrl] = useState<string | null>(null)
  const [aiBusy, setAiBusy] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [lastApi, setLastApi] = useState<any>(null)
  const [colorTemp, setColorTemp] = useState(0)
  const [saturation, setSaturation] = useState(0)
  const [saved, setSaved] = useState<{id:string; dataUrl:string; createdAt:string}[]>([])
  const imgEl = useRef<HTMLImageElement>(null)
  const originalImgEl = useRef<HTMLImageElement>(null)

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
    }, 100) // デバウンス処理

    return () => clearTimeout(timeoutId)
  }, [colorTemp, saturation, imgUrl])

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f)
  }
  function handleFile(f: File | null) {
    if (!f) return
    setUploadError(null)
    const okType = /image\/(png|jpe?g)/.test(f.type)
    const okSize = f.size <= 10 * 1024 * 1024
    if (!okType) return setUploadError('Only JPG/PNG supported')
    if (!okSize) return setUploadError('Max 10MB')
    setFile(f)
  }
  
  function doLogin() { if (emailRef.current?.value && passRef.current?.value) setLoggedIn(true) }

  async function aiGenerate() {
    if (!file || !imgEl.current) return alert(t.needImage)
    
    setAiBusy(true)
    setAiError(null)
    
    try {
      const resp = await generateBackgroundWithAI(aiPrompt)
      
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
          message: 'AI background generated and composed' 
        })
      } else {
        setAiError(resp.error || 'Failed to generate background')
        setLastApi(resp)
      }
    } catch (error: any) {
      setAiError(error.message || 'Unknown error')
      setLastApi({ status: 500, ok: false, error: error.message })
    } finally {
      setAiBusy(false)
    }
  }
  
  function applyAdjust() { 
    setLastApi((p:any) => ({ ...(p||{}), filterApplied: true, message: 'applied' }))
  }

  async function saveToGallery() {
    if (!processedImgUrl && !imgUrl) return alert(t.needImage)
    const dataUrl = processedImgUrl || imgUrl!
    const resp = await mockSave(dataUrl)
    setLastApi(resp)
    if (resp.ok) setSaved(arr => [{ id: resp.id, dataUrl, createdAt: new Date().toISOString() }, ...arr])
  }
  function downloadCurrent() {
    if (!processedImgUrl && !imgUrl) return alert(t.needImage)
    const dataUrl = processedImgUrl || imgUrl!
    const a = document.createElement('a'); a.href = dataUrl; a.download = `mabl-cosme-demo-${Date.now()}.png`; a.click()
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold" data-testid="app-title">{t.appTitle}</h1>
            <p className="text-sm opacity-70">Mock UI for mabl E2E demo</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm" htmlFor="env-select">{t.env}</label>
              <select id="env-select" data-testid="env-select" className="border rounded-xl px-3 py-2" value={env} onChange={(e) => setEnv(e.target.value as any)}>
                <option value="staging">staging.mabl-cosme.com</option>
                <option value="production">app.mabl-cosme.com</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm" htmlFor="lang-select">{t.language}</label>
              <select id="lang-select" data-testid="lang-select" className="border rounded-xl px-3 py-2" value={locale} onChange={(e) => setLocale(e.target.value as Locale)}>
                {LOCALES.map(lc => <option key={lc} value={lc}>{lc.toUpperCase()}</option>)}
              </select>
            </div>
          </div>
        </header>

        <section className="bg-white rounded-2xl shadow p-4 md:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Auth</h2>
            {loggedIn ? (
              <button data-testid="btn-logout" onClick={() => setLoggedIn(false)} className="rounded-xl px-4 py-2 border">{t.logout}</button>
            ) : null}
          </div>
          {!loggedIn ? (
            <div className="grid md:grid-cols-4 gap-3 mt-3">
              <div className="md:col-span-1">
                <label className="text-sm block mb-1">{t.email}</label>
                <input data-testid="email" ref={emailRef} className="w-full border rounded-xl px-3 py-2" placeholder="user@example.com"/>
              </div>
              <div className="md:col-span-1">
                <label className="text-sm block mb-1">{t.password}</label>
                <input data-testid="password" ref={passRef} type="password" className="w-full border rounded-xl px-3 py-2" placeholder="••••••••"/>
              </div>
              <div className="md:col-span-2 flex items-end">
                <button data-testid="btn-login" onClick={doLogin} className="rounded-xl px-5 py-2 border w-full md:w-auto">{t.login}</button>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-emerald-700" data-testid="login-state">Logged in</p>
          )}
        </section>

        <section className="bg-white rounded-2xl shadow p-4 md:p-6">
          <h2 className="text-lg font-medium mb-3">Upload</h2>
          <div onDrop={onDrop} onDragOver={(e)=>e.preventDefault()} className="border-2 border-dashed rounded-2xl p-6 flex flex-col md:flex-row gap-4 items-center justify-center">
            <label className="cursor-pointer border rounded-xl px-4 py-2" htmlFor="file-input" data-testid="btn-upload">{t.upload}</label>
            <input id="file-input" type="file" className="hidden" accept="image/png,image/jpeg" onChange={(e)=>handleFile(e.target.files?.[0] ?? null)} />
            <span className="opacity-70 text-sm">{t.orDrop}</span>
            {uploadError && <span className="text-red-600 text-sm" data-testid="upload-error">{uploadError}</span>}
          </div>

          {/* 元画像を非表示で保持 */}
          {imgUrl && (
            <img ref={originalImgEl} src={imgUrl} alt="original" className="hidden" onLoad={()=>setLastApi({ok:true,message:'image-loaded'})} />
          )}

          <div className="mt-4 grid md:grid-cols-2 gap-6">
            <div className="aspect-square bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden">
              {(processedImgUrl || imgUrl) ? (
                <img data-testid="img-preview" ref={imgEl} src={processedImgUrl || imgUrl!} alt="preview" className="object-contain w-full h-full" />
              ) : (<span className="opacity-50">No image</span>)}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm block mb-2" htmlFor="ai-prompt">{t.promptLabel}</label>
                <textarea 
                  id="ai-prompt"
                  data-testid="ai-prompt"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder={t.defaultPrompt}
                  className="w-full border rounded-xl px-3 py-2 text-sm mb-3"
                  rows={2}
                />
                <button data-testid="btn-ai-generate" onClick={aiGenerate} disabled={!imgUrl || aiBusy} className="rounded-xl px-4 py-2 border disabled:opacity-50">
                  {aiBusy ? t.generating : t.aiGenerate}
                </button>
                {aiError && <p className="text-red-600 text-sm mt-2" data-testid="ai-error">{aiError}</p>}
              </div>

              <div className="bg-slate-50 rounded-2xl p-4">
                <h3 className="font-medium mb-3">{t.adjust}</h3>
                <div className="grid grid-cols-5 gap-3 items-center">
                  <label className="text-sm col-span-2" htmlFor="temp">{t.colorTemp}: {colorTemp}</label>
                  <input id="temp" data-testid="slider-temp" type="range" min={-100} max={100} value={colorTemp} onChange={(e)=>setColorTemp(clamp(parseInt(e.target.value),-100,100))} className="col-span-3" />
                  <label className="text-sm col-span-2" htmlFor="sat">{t.saturation}: {saturation}</label>
                  <input id="sat" data-testid="slider-sat" type="range" min={-100} max={100} value={saturation} onChange={(e)=>setSaturation(clamp(parseInt(e.target.value),-100,100))} className="col-span-3" />
                </div>
                <button data-testid="btn-apply" onClick={applyAdjust} className="mt-3 rounded-xl px-4 py-2 border">{t.apply}</button>
              </div>

              <div className="flex gap-3">
                <button data-testid="btn-save" onClick={saveToGallery} className="rounded-xl px-4 py-2 border">{t.save}</button>
                <button data-testid="btn-download" onClick={downloadCurrent} className="rounded-xl px-4 py-2 border">{t.download}</button>
              </div>

              <pre data-testid="api-payload" className="text-xs bg-slate-100 rounded-xl p-3 overflow-auto max-h-40">{JSON.stringify(lastApi, null, 2)}</pre>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow p-4 md:p-6">
          <h2 className="text-lg font-medium mb-3">{t.gallery}</h2>
          {saved.length === 0 ? (
            <p className="text-sm opacity-60">—</p>
          ) : (
            <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {saved.map(g => (
                <li key={g.id} className="rounded-2xl border overflow-hidden">
                  <img src={g.dataUrl} alt={g.id} className="w-full h-48 object-cover" />
                  <div className="p-3 text-xs opacity-70">
                    <div>ID: <span data-testid={`gallery-id-${g.id}`}>{g.id}</span></div>
                    <div>{new Date(g.createdAt).toLocaleString()}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="text-xs opacity-60 text-center py-6">
          <p>Demo only. No data leaves your browser.</p>
        </footer>
      </div>
    </div>
  )
}