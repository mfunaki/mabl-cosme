import { useRef } from 'react'
import { useTranslation } from '../contexts/LanguageContext'

interface AuthSectionProps {
  loggedIn: boolean
  setLoggedIn: (loggedIn: boolean) => void
}

export function AuthSection({ loggedIn, setLoggedIn }: AuthSectionProps) {
  const { t } = useTranslation()
  const emailRef = useRef<HTMLInputElement>(null)
  const passRef = useRef<HTMLInputElement>(null)

  function doLogin() {
    if (emailRef.current?.value && passRef.current?.value) {
      setLoggedIn(true)
    }
  }

  return (
    <section className="bg-white rounded-2xl shadow p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Auth</h2>
        {loggedIn ? (
          <button
            data-testid="btn-logout"
            onClick={() => setLoggedIn(false)}
            className="rounded-xl px-4 py-2 border"
          >
            {t.logout}
          </button>
        ) : null}
      </div>
      {!loggedIn ? (
        <div className="grid md:grid-cols-4 gap-3 mt-3">
          <div className="md:col-span-1">
            <label className="text-sm block mb-1">{t.email}</label>
            <input
              data-testid="email"
              ref={emailRef}
              className="w-full border rounded-xl px-3 py-2"
              placeholder="user@example.com"
            />
          </div>
          <div className="md:col-span-1">
            <label className="text-sm block mb-1">{t.password}</label>
            <input
              data-testid="password"
              ref={passRef}
              type="password"
              className="w-full border rounded-xl px-3 py-2"
              placeholder="••••••••"
            />
          </div>
          <div className="md:col-span-2 flex items-end">
            <button
              data-testid="btn-login"
              onClick={doLogin}
              className="rounded-xl px-5 py-2 border w-full md:w-auto"
            >
              {t.login}
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-sm text-emerald-700" data-testid="login-state">
          Logged in
        </p>
      )}
    </section>
  )
}
