import Link from 'next/link'
import { resetPassword } from './actions'

export const metadata = {
  title: 'Mot de passe oublié',
}

export default function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  return (
    <div style={{ background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: 'var(--font-sans)' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#E8703A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: '#000' }}>P</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#fff' }}>Réinitialisation</h1>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: '#8E8E93', fontWeight: 400 }}>
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

        {/* Form Card */}
        <div style={{ background: '#1C1C1E', borderRadius: 28, padding: '28px 24px' }}>
          <form action={resetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label htmlFor="email" style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#8E8E93', marginBottom: 8 }}>
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
                  background: '#2C2C2E',
                  color: '#fff',
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

            <button
              type="submit"
              style={{
                width: '100%',
                height: 50,
                borderRadius: 100,
                border: 'none',
                background: '#E8703A',
                color: '#fff',
                fontSize: 15,
                fontWeight: 600,
                fontFamily: 'var(--font-sans)',
                cursor: 'pointer',
                marginTop: 4,
              }}
            >
              Envoyer le lien
            </button>
          </form>
        </div>

        {/* Bottom link */}
        <p style={{ textAlign: 'center', fontSize: 14, color: '#8E8E93', marginTop: 24 }}>
          Vous vous souvenez de votre mot de passe ?{' '}
          <Link href="/login" style={{ color: '#E8703A', fontWeight: 500, textDecoration: 'none' }}>
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
