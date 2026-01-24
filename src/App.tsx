import { useState } from 'react'
import { type ApiServerId } from './constants/config'
import { Header, AuthSection, ImageEditor, Gallery, type GalleryItem } from './components'

/**
 * mabl-cosme Demo (React)
 * - Backend proxy for OpenAI API
 * - Tailwind classes via CDN
 * - Elements instrumented with data-testid for mabl
 */

export default function App() {
  const [env, setEnv] = useState<'staging' | 'production'>('staging')
  const [apiServerId, setApiServerId] = useState<ApiServerId>('same')
  const [loggedIn, setLoggedIn] = useState(false)
  const [saved, setSaved] = useState<GalleryItem[]>([])

  const handleSave = (item: GalleryItem) => {
    setSaved((arr) => [item, ...arr])
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Header
          env={env}
          setEnv={setEnv}
          apiServerId={apiServerId}
          setApiServerId={setApiServerId}
        />

        <AuthSection loggedIn={loggedIn} setLoggedIn={setLoggedIn} />

        <ImageEditor apiServerId={apiServerId} onSave={handleSave} />

        <Gallery items={saved} />

        <footer className="text-xs opacity-60 text-center py-6">
          <p>Demo only. No data leaves your browser.</p>
        </footer>
      </div>
    </div>
  )
}
