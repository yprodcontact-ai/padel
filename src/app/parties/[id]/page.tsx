import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function PartyDetailsPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  
  const { data: party, error } = await supabase
    .from('parties')
    .select(`
      *,
      clubs (nom, ville),
      users:createur_id (prenom, nom, niveau, photo_url)
    `)
    .eq('id', params.id)
    .single()

  if (error || !party) {
    notFound()
  }

  const dateMatch = new Date(party.date_heure).toLocaleString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  return (
    <div className="flex min-h-screen w-full flex-col p-4 bg-muted/20 pb-20">
      <div className="mx-auto w-full max-w-md pt-4">
        
        <Link href="/" className="text-sm text-primary mb-4 block">
          &larr; Retour à l&apos;accueil
        </Link>
        
        <div className="bg-card rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {party.type}
              </span>
              <h1 className="text-2xl font-bold mt-3">Match ({party.visibilite})</h1>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Où</p>
              <p className="font-semibold text-lg">{party.clubs?.nom} - {party.clubs?.ville}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Quand</p>
              <p className="font-semibold text-lg capitalize">{dateMatch}</p>
            </div>
            
            <div>
               <p className="text-sm text-muted-foreground">Niveaux acceptés</p>
               <p className="font-semibold text-lg">{party.niveau_min} à {party.niveau_max}</p>
            </div>

            {party.commentaire && (
              <div className="bg-muted p-4 rounded-lg mt-4 text-sm italic">
                &quot;{party.commentaire}&quot;
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
