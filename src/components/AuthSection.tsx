import { useRef, useState } from 'react'
import { useTranslation } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import { API_SERVERS, type ApiServerId } from '../constants/config'

interface AuthSectionProps {
  apiServerId: ApiServerId
  setApiServerId: (id: ApiServerId) => void
}

export function AuthSection({ apiServerId, setApiServerId }: AuthSectionProps) {
  const { t } = useTranslation()
  const { login } = useAuth()
  const usernameRef = useRef<HTMLInputElement>(null)
  const passRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function doLogin() {
    const username = usernameRef.current?.value
    const password = passRef.current?.value

    if (!username || !password) {
      setError(t.loginErrorEmpty)
      return
    }

    setIsLoading(true)
    setError(null)

    const result = await login(username, password, apiServerId)

    setIsLoading(false)

    if (!result.success) {
      setError(result.error || t.loginErrorInvalid)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !isLoading) {
      doLogin()
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center mb-6" data-testid="app-title">
          {t.appTitle}
        </h1>
        <p className="text-sm text-center text-slate-500 mb-6">
          {t.loginDescription}
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-sm block mb-1">{t.apiServer}</label>
            <select
              data-testid="api-server-select"
              value={apiServerId}
              onChange={(e) => setApiServerId(e.target.value as ApiServerId)}
              className="w-full border rounded-xl px-3 py-2"
            >
              {API_SERVERS.map((server) => (
                <option key={server.id} value={server.id}>
                  {server.id === 'same' ? t.sameHost : t.cloudServer}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm block mb-1">{t.username}</label>
            <input
              data-testid="username"
              ref={usernameRef}
              className="w-full border rounded-xl px-3 py-2"
              placeholder={t.usernamePlaceholder}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="text-sm block mb-1">{t.password}</label>
            <input
              data-testid="password"
              ref={passRef}
              type="password"
              className="w-full border rounded-xl px-3 py-2"
              placeholder="••••••••"
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600" data-testid="login-error">
              {error}
            </p>
          )}

          <button
            data-testid="btn-login"
            onClick={doLogin}
            disabled={isLoading}
            className="w-full rounded-xl px-5 py-2 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {isLoading ? '...' : t.login}
          </button>
        </div>
      </div>
    </div>
  )
}
