import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { MapPinIcon, BadgeCheckIcon } from 'lucide-react'
import Link from 'next/link'
import { SearchInput } from './components/search-input'

export const metadata = {
  title: 'Trouver un Club',
}

export default async function ClubsPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const query = searchParams?.q || ''
  const supabase = createClient()

  let request = supabase.from('clubs').select('*').order('nom')

  if (query) {
    // ilike permet une recherche insensible à la casse
    request = request.or(`nom.ilike.%${query}%,ville.ilike.%${query}%`)
  }

  const { data: clubs, error } = await request

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/20">
      <div className="bg-primary px-4 py-6 text-primary-foreground sticky top-0 z-10 shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Trouver un Club</h1>
        <SearchInput />
      </div>

      <div className="p-4 space-y-4 max-w-md mx-auto w-full pb-20">
        {error && <p className="text-destructive">Erreur lors de la récupération des clubs.</p>}
        
        {clubs && clubs.length === 0 && (
          <p className="text-center text-muted-foreground mt-10">Aucun club ne correspond à votre recherche.</p>
        )}

        {clubs && clubs.map((club) => (
          <Link key={club.id} href={`/clubs/${club.id}`} className="block">
             <Card className="hover:bg-accent/50 transition-colors border-2 hover:border-primary/50 shadow-sm">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg flex items-center">
                      {club.nom}
                      {club.verified && <BadgeCheckIcon className="w-5 h-5 ml-1 text-blue-500 flex-shrink-0" />}
                    </h3>
                    <div className="flex items-center text-muted-foreground text-sm mt-1">
                      <MapPinIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                      {club.ville}
                    </div>
                  </div>
                  <div className="text-center bg-primary/10 rounded-lg p-2 min-w-[60px]">
                     <span className="block font-bold text-primary text-xl leading-none">{club.nb_pistes}</span>
                     <span className="text-[10px] uppercase font-bold text-primary/70">Pistes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
