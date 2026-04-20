import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { MapPinIcon, PhoneIcon, MailIcon, ChevronLeftIcon, BadgeCheckIcon, LayoutGridIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { setMainClub } from '../actions'

export const metadata = {
  title: 'Détail du Club',
}

export default async function ClubDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) {
    redirect('/login')
  }

  const [clubResponse, userResponse] = await Promise.all([
    supabase.from('clubs').select('*').eq('id', params.id).single(),
    supabase.from('users').select('club_id').eq('id', authData.user.id).single(),
  ])

  if (clubResponse.error || !clubResponse.data) {
    notFound()
  }

  const club = clubResponse.data
  const isMainClub = userResponse.data?.club_id === club.id

  const setMainClubWithId = setMainClub.bind(null, club.id)

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/20 pb-20">
      {/* Header Image / Map Placeholder */}
      <div className="relative h-48 bg-primary/20 w-full">
         {/* Bouton retour */}
         <Link href="/clubs" className="absolute top-4 left-4 z-10 bg-background/80 p-2 rounded-full shadow-sm backdrop-blur-sm">
            <ChevronLeftIcon className="w-6 h-6" />
         </Link>
         
         {club.photo_url ? (
            <img src={club.photo_url} alt={club.nom} className="w-full h-full object-cover" />
         ) : (
            <div className="w-full h-full flex items-center justify-center text-primary/30">
               <LayoutGridIcon className="w-20 h-20" />
            </div>
         )}
      </div>

      <div className="px-4 -mt-8 relative z-10 mx-auto w-full max-w-md">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-bold flex items-center">
                {club.nom}
                {club.verified && <BadgeCheckIcon className="w-6 h-6 ml-1 text-blue-500 flex-shrink-0" />}
              </h1>
              <div className="text-center bg-primary/10 rounded-lg p-2 min-w-[60px]">
                 <span className="block font-bold text-primary text-xl leading-none">{club.nb_pistes}</span>
                 <span className="text-[10px] uppercase font-bold text-primary/70">Pistes</span>
              </div>
            </div>

            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              {club.description || "Aucune description disponible pour ce club."}
            </p>

            <div className="space-y-4 border-t pt-4">
              {club.adresse && (
                <div className="flex items-start">
                  <MapPinIcon className="w-5 h-5 text-muted-foreground mr-3 shrink-0 mt-0.5" />
                  <span className="text-sm">{club.adresse}, {club.ville}</span>
                </div>
              )}
              {club.telephone && (
                <div className="flex items-center">
                  <PhoneIcon className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
                  <a href={`tel:${club.telephone.replace(/\s+/g, '')}`} className="text-sm text-primary hover:underline">
                    {club.telephone}
                  </a>
                </div>
              )}
              {club.email && (
                <div className="flex items-center">
                  <MailIcon className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
                  <a href={`mailto:${club.email}`} className="text-sm text-primary hover:underline">
                    {club.email}
                  </a>
                </div>
              )}
            </div>
            
            <div className="mt-8">
              {isMainClub ? (
                <div className="w-full h-12 flex items-center justify-center bg-green-100 text-green-800 font-medium rounded-md text-sm">
                  ✓ C&apos;est votre club principal
                </div>
              ) : (
                <form action={setMainClubWithId}>
                  <Button type="submit" className="w-full h-12 text-base">
                    Définir comme mon club principal
                  </Button>
                </form>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
