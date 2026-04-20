import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
          <CardDescription>
            Entrez votre email ci-dessous pour vous connecter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={login} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Oublié ?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                  className="h-12"
                />
              </div>
            </div>

            {searchParams?.error && (
              <div className="text-sm font-medium text-destructive text-center">
                {searchParams.error}
              </div>
            )}
            {searchParams?.message && (
              <div className="text-sm font-medium text-green-600 text-center">
                {searchParams.message}
              </div>
            )}

            <Button type="submit" className="w-full h-12 text-base">
              Se connecter
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            Pas encore de compte ?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              S&apos;inscrire
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
