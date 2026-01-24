import { LOCALES, API_SERVERS, type ApiServerId } from '../constants/config'
import { useTranslation } from '../contexts/LanguageContext'
import type { Locale } from '../i18n/types'

interface HeaderProps {
  env: 'staging' | 'production'
  setEnv: (env: 'staging' | 'production') => void
  apiServerId: ApiServerId
  setApiServerId: (id: ApiServerId) => void
}

export function Header({ env, setEnv, apiServerId, setApiServerId }: HeaderProps) {
  const { locale, setLocale, t } = useTranslation()

  return (
    <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold" data-testid="app-title">
          {t.appTitle}
        </h1>
        <p className="text-sm opacity-70">Mock UI for mabl E2E demo</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm" htmlFor="env-select">
            {t.env}
          </label>
          <select
            id="env-select"
            data-testid="env-select"
            className="border rounded-xl px-3 py-2"
            value={env}
            onChange={(e) => setEnv(e.target.value as 'staging' | 'production')}
          >
            <option value="staging">staging.mabl-cosme.com</option>
            <option value="production">app.mabl-cosme.com</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm" htmlFor="lang-select">
            {t.language}
          </label>
          <select
            id="lang-select"
            data-testid="lang-select"
            className="border rounded-xl px-3 py-2"
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
          >
            {LOCALES.map((lc) => (
              <option key={lc} value={lc}>
                {lc.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm" htmlFor="api-server-select">
            {t.apiServer}
          </label>
          <select
            id="api-server-select"
            data-testid="api-server-select"
            className="border rounded-xl px-3 py-2"
            value={apiServerId}
            onChange={(e) => setApiServerId(e.target.value as ApiServerId)}
          >
            {API_SERVERS.map((server) => (
              <option key={server.id} value={server.id}>
                {t[server.label]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  )
}
