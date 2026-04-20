import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { updateProfile } from './actions'
import { getClubs } from '@/app/onboarding/actions'

export const metadata = {
  title: 'Modifier le Profil',
}

export default async function ProfileEditPage() {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) {
    redirect('/login')
  }

  const [{ data: userProfile }, clubs] = await Promise.all([
    supabase.from('users').select('*').eq('id', authData.user.id).single(),
    getClubs()
  ])

  if (!userProfile) {
    redirect('/onboarding')
  }

  return (
    <div className="flex min-h-screen w-full flex-col p-4 bg-muted/20 items-center">
      <div className="w-full max-w-md pb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Modifier Profil</h1>
        <Link href="/profile">
          <Button variant="ghost" size="sm">Annuler</Button>
        </Link>
      </div>

      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <form action={updateProfile} className="space-y-6">
            
            <div className="space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2">Informations Générales</h2>
              
              <div className="space-y-2">
                <Label htmlFor="photo">Nouvelle Photo (Optionnel)</Label>
                <Input id="photo" name="photo" type="file" accept="image/*" className="h-12" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom</Label>
                  <Input id="prenom" name="prenom" required defaultValue={userProfile.prenom || ''} className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom</Label>
                  <Input id="nom" name="nom" required defaultValue={userProfile.nom || ''} className="h-12" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date_naissance">Date de naissance</Label>
                <Input id="date_naissance" name="date_naissance" type="date" required defaultValue={userProfile.date_naissance || ''} className="h-12" />
              </div>

              <div className="space-y-2 pt-2">
                <Label>Sexe</Label>
                <RadioGroup name="sexe" defaultValue={userProfile.sexe || 'homme'} className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="homme" id="r-homme" />
                    <Label htmlFor="r-homme" className="font-normal">Homme</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="femme" id="r-femme" />
                    <Label htmlFor="r-femme" className="font-normal">Femme</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="autre" id="r-autre" />
                    <Label htmlFor="r-autre" className="font-normal">Autre</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ville">Ville principale</Label>
                <Input id="ville" name="ville" required defaultValue={userProfile.ville || ''} className="h-12" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" name="bio" placeholder="Parlez un peu de vous..." defaultValue={userProfile.bio || ''} className="resize-none" />
              </div>
            </div>

            <div className="space-y-4 pt-4">
               <h2 className="text-lg font-semibold border-b pb-2">Informations Padel</h2>
              
               <div className="space-y-2">
                  <Label htmlFor="niveau">Niveau (1.0 à 8.0)</Label>
                  <Input 
                    id="niveau" 
                    name="niveau" 
                    type="number" 
                    step="0.5" 
                    min="1" 
                    max="8" 
                    required 
                    defaultValue={userProfile.niveau || 4}
                    className="h-12" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="club_id">Club principal</Label>
                  <select name="club_id" defaultValue={userProfile.club_id || 'none'} className="flex h-12 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                     <option value="none">Aucun / Je ne joue pas en club</option>
                      {clubs.map((club) => (
                        <option key={club.id} value={club.id}>
                          {club.nom} ({club.ville})
                        </option>
                      ))}
                  </select>
                </div>

                 <div className="space-y-2">
                  <Label htmlFor="licence_fft">Numéro de licence FFT (Optionnel)</Label>
                  <Input id="licence_fft" name="licence_fft" defaultValue={userProfile.licence_fft || ''} className="h-12" />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Main dominante</Label>
                    <RadioGroup name="main" defaultValue={userProfile.main || 'droite'} className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="droite" id="m-droite" />
                        <Label htmlFor="m-droite" className="font-normal">Droite</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="gauche" id="m-gauche" />
                        <Label htmlFor="m-gauche" className="font-normal">Gauche</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>Poste préféré</Label>
                    <RadioGroup name="poste" defaultValue={userProfile.poste || 'indifférent'} className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="droite" id="p-droite" />
                        <Label htmlFor="p-droite" className="font-normal">Droite</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="gauche" id="p-gauche" />
                        <Label htmlFor="p-gauche" className="font-normal">Gauche</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="indifférent" id="p-indifferent" />
                        <Label htmlFor="p-indifferent" className="font-normal">Indifférent</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
            </div>

            <Button type="submit" className="w-full h-12 text-base mt-6">
              Enregistrer les modifications
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
