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
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">Réinitialisation</CardTitle>
          <CardDescription>
            Entrez votre email pour recevoir un lien de réinitialisation de votre mot de passe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={resetPassword} className="space-y-6">
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
            </div>

            {searchParams?.error && (
              <div className="text-sm rounded-md font-medium text-destructive text-center">
                {searchParams.error}
              </div>
            )}

            <Button type="submit" className="w-full h-12 text-base">
              Envoyer le lien
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            Vous vous souvenez de votre mot de passe ?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Se connecter
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
