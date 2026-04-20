import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MapPinIcon, TrophyIcon, ActivityIcon, FileTextIcon } from 'lucide-react'

export const metadata = {
  title: 'Mon Profil',
}

function getAge(dateString: string | null) {
  if (!dateString) return null
  const today = new Date()
  const birthDate = new Date(dateString)
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
  }
  return age
}

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: authData, error: authError } = await supabase.auth.getUser()

  if (authError || !authData.user) {
    redirect('/login')
  }

  // Récupérer le profil et le nom du club (jointure)
  const { data: userProfile, error } = await supabase
    .from('users')
    .select(`
      *,
      clubs:club_id (
        nom,
        ville
      )
    `)
    .eq('id', authData.user.id)
    .single()

  if (error || !userProfile) {
    // Si l'utilisateur n'a pas de profil, c'est qu'il n'a pas fait l'onboarding
    // Note: Le trigger 'on_auth_user_created' crée la ligne, donc il devrait y en avoir une.
    redirect('/onboarding')
  }

  const age = getAge(userProfile.date_naissance)

  return (
    <div className="flex min-h-screen w-full flex-col p-4 bg-muted/20">
      <div className="mx-auto w-full max-w-md pb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Profil</h1>
        <Link href="/profile/edit">
          <Button variant="outline" size="sm">Modifier</Button>
        </Link>
      </div>

      <Card className="mx-auto w-full max-w-md overflow-hidden relative shadow-sm">
        {/* Banner background */}
        <div className="h-28 bg-primary/10 w-full absolute top-0 left-0" />
        
        <CardHeader className="text-center pt-16 relative z-10">
          <Avatar className="w-24 h-24 mx-auto border-4 border-background shadow-sm bg-muted text-2xl font-bold">
            <AvatarImage src={userProfile.photo_url || ''} alt={userProfile.prenom || 'User'} className="object-cover" />
            <AvatarFallback>{(userProfile.prenom?.[0] || '') + (userProfile.nom?.[0] || '')}</AvatarFallback>
          </Avatar>
          
          <CardTitle className="text-2xl font-bold mt-4">
            {userProfile.prenom} {userProfile.nom}
          </CardTitle>
          <CardDescription className="flex items-center justify-center space-x-1 mt-1 text-base">
            <MapPinIcon className="w-4 h-4" />
            <span>{userProfile.ville || 'Ville non renseignée'}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Statistiques Rapides */}
          <div className="grid grid-cols-3 gap-4 border-y py-4 px-2">
            <div className="text-center space-y-1">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Niveau</span>
              <p className="text-lg font-bold text-primary">{userProfile.niveau || '-'}</p>
            </div>
            <div className="text-center space-y-1 border-x">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Fiabilité</span>
              <p className="text-lg font-bold text-primary">{userProfile.fiabilite_score || '10'}/10</p>
            </div>
            <div className="text-center space-y-1">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Âge</span>
              <p className="text-lg font-bold text-primary">{age ? `${age} ans` : '-'}</p>
            </div>
          </div>

          {/* Informations détaillées */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <TrophyIcon className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium leading-none">Club principal</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {userProfile.clubs?.nom ? `${userProfile.clubs.nom} (${userProfile.clubs.ville})` : 'Aucun club renseigné'}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <ActivityIcon className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium leading-none">Préférences de jeu</p>
                <p className="text-sm text-muted-foreground mt-1 capitalize">
                  Main: {userProfile.main || '?'} • Poste: {userProfile.poste || '?'}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FileTextIcon className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium leading-none">Bio</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {userProfile.bio || 'Aucune biographie.'}
                </p>
              </div>
            </div>
            
             <div className="flex items-start space-x-3">
              <span className="w-5 h-5 flex items-center justify-center text-muted-foreground mt-0.5 font-bold font-serif">#</span>
              <div>
                <p className="text-sm font-medium leading-none">Numéro de Licence</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {userProfile.licence_fft || 'Non renseigné'}
                </p>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
