import Link from 'next/link'
import { login } from './actions'

export const metadata = {
  title: 'Connexion',
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string, message?: string }
}) {
  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: 'var(--font-sans)' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f2c991', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: 'var(--background)' }}>P</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: 'var(--foreground)' }}>Connexion</h1>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--muted-foreground)', fontWeight: 400 }}>
            Entrez votre email ci-dessous pour vous connecter
          </p>
        </div>

        {/* Form Card */}
        <div style={{ backgroundColor: 'var(--card)', borderRadius: 28, padding: '28px 24px' }}>
          <form action={login} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label htmlFor="email" style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--muted-foreground)', marginBottom: 8 }}>
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                style={{
                  width: '100%',
                  height: 50,
                  borderRadius: 14,
                  border: 'none',
                  backgroundColor: 'var(--muted)',
                  color: 'var(--foreground)',
                  fontSize: 15,
                  padding: '0 16px',
                  outline: 'none',
                  fontFamily: 'var(--font-sans)',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label htmlFor="password" style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted-foreground)' }}>
                  Mot de passe
                </label>
                <Link href="/forgot-password" style={{ fontSize: 12, fontWeight: 500, color: '#f2c991', textDecoration: 'none' }}>
                  Oublié ?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                style={{
                  width: '100%',
                  height: 50,
                  borderRadius: 14,
                  border: 'none',
                  backgroundColor: 'var(--muted)',
                  color: 'var(--foreground)',
                  fontSize: 15,
                  padding: '0 16px',
                  outline: 'none',
                  fontFamily: 'var(--font-sans)',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {searchParams?.error && (
              <div style={{ fontSize: 13, fontWeight: 500, color: '#EF4444', textAlign: 'center', padding: '8px 0' }}>
                {searchParams.error}
              </div>
            )}
            {searchParams?.message && (
              <div style={{ fontSize: 13, fontWeight: 500, color: '#22C55E', textAlign: 'center', padding: '8px 0' }}>
                {searchParams.message}
              </div>
            )}

            <button
              type="submit"
              style={{
                width: '100%',
                height: 50,
                borderRadius: 100,
                border: '1px solid #cf9619', background: '#f2c991',
                color: 'var(--foreground)',
                fontSize: 15,
                fontWeight: 600,
                fontFamily: 'var(--font-sans)',
                cursor: 'pointer',
                marginTop: 4,
              }}
            >
              Se connecter
            </button>
          </form>
        </div>

        {/* Bottom link */}
        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--muted-foreground)', marginTop: 24 }}>
          Pas encore de compte ?{' '}
          <Link href="/register" style={{ color: '#f2c991', fontWeight: 500, textDecoration: 'none' }}>
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </div>
  )
}
