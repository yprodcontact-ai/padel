import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PartyActionButtons } from './party-buttons'
import { BackButton } from '@/components/back-button'
import { PendingRequests } from './pending-requests'
import { formatDatetime } from '@/lib/date-utils'

type Player = {
  user_id: string;
  statut: string;
  users: {
    prenom: string;
    nom: string;
    photo_url: string;
    niveau: number | string;
  } | null;
}

export default async function PartyDetailsPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  
  const { data: authData } = await supabase.auth.getUser()
  const currentUserId = authData.user?.id

  const { data: party, error } = await supabase
    .from('parties')
    .select(`
      *,
      clubs (nom, ville),
      users:createur_id (prenom, nom, niveau, photo_url),
      party_players (
        user_id,
        statut,
        users (prenom, nom, photo_url, niveau)
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !party) {
    notFound()
  }

  // Fetch group conversation
  const { data: conversation } = await supabase
    .from('conversations')
    .select('id')
    .eq('party_id', params.id)
    .single()

  // Fetch current user's level
  let userLevel: number | null = null
  if (currentUserId) {
    const { data: userProfile } = await supabase
      .from('users')
      .select('niveau')
      .eq('id', currentUserId)
      .single()
    userLevel = userProfile?.niveau ? parseFloat(userProfile.niveau) : null
  }

  const isCreator = currentUserId === party.createur_id
  const allPlayers = party.party_players || []
  const confirmedPlayers = allPlayers.filter((p: Player) => p.statut === 'inscrit')
  const pendingPlayers = allPlayers.filter((p: Player) => p.statut === 'en_attente')
  const isParticipant = confirmedPlayers.some((p: Player) => p.user_id === currentUserId)
  const isPending = pendingPlayers.some((p: Player) => p.user_id === currentUserId)
  const playerCount = confirmedPlayers.length

  const dateMatch = formatDatetime(party.date_heure)

  // Determine if user level is below the party range
  const isBelowLevel = userLevel !== null && party.niveau_min !== null && userLevel < party.niveau_min

  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', paddingBottom: 100, fontFamily: 'var(--font-sans)' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 16px 0' }}>
        
        {/* Back link */}
        <div style={{ marginBottom: 20 }}>
          <BackButton />
        </div>
        
        {/* Main card */}
        <div style={{ backgroundColor: 'var(--foreground)', borderRadius: 28, padding: '26px 24px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--background)' }}>Match ({party.visibilite})</h1>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Où</p>
              <p style={{ margin: '4px 0 0', fontSize: 17, fontWeight: 600, color: 'var(--background)' }}>{party.clubs?.nom} - {party.clubs?.ville}</p>
            </div>
            
            <div>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Quand</p>
              <p style={{ margin: '4px 0 0', fontSize: 17, fontWeight: 600, color: 'var(--background)', textTransform: 'capitalize' }}>{dateMatch}</p>
            </div>
            
            <div>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Niveaux acceptés</p>
              <p style={{ margin: '4px 0 0', fontSize: 17, fontWeight: 600, color: 'var(--background)' }}>{party.niveau_min} à {party.niveau_max}</p>
            </div>

            {party.commentaire && (
              <div style={{ background: '#F5F5F7', padding: '14px 16px', borderRadius: 16, fontSize: 14, fontStyle: 'italic', color: 'var(--border)', marginTop: 4 }}>
                &quot;{party.commentaire}&quot;
              </div>
            )}
          </div>
        </div>

        {/* PENDING REQUESTS (visible only to creator) */}
        {isCreator && pendingPlayers.length > 0 && (
          <PendingRequests partyId={party.id} pendingPlayers={pendingPlayers.map((p: Player) => ({
            user_id: p.user_id,
            prenom: p.users?.prenom || '',
            nom: p.users?.nom || '',
            photo_url: p.users?.photo_url || null,
            niveau: p.users?.niveau || null,
          }))} />
        )}
        
        {/* BOUTON CHAT */}
        {isParticipant && conversation && (
          <Link href={`/messages/${conversation.id}`} style={{ display: 'block', marginBottom: 16, textDecoration: 'none' }}>
            <div style={{ background: '#f2c991', padding: '16px 20px', borderRadius: 100, textAlign: 'center', fontWeight: 600, fontSize: 15, color: 'var(--foreground)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              💬 Accéder au Chat de groupe
            </div>
          </Link>
        )}
        
        {/* BOUTONS D'ACTION (Client Component) */}
        {currentUserId && (
          <PartyActionButtons 
            partyId={party.id}
            isCreator={isCreator}
            isParticipant={isParticipant}
            isPending={isPending}
            isBelowLevel={isBelowLevel}
            status={party.statut}
            playerCount={playerCount}
          />
        )}

        {/* SECTION JOUEURS */}
        <div style={{ backgroundColor: 'var(--card)', borderRadius: 28, padding: '24px 22px', marginBottom: 16 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 600, color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#f2c991" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
            Joueurs Inscrits ({playerCount}/4)
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {confirmedPlayers.map((player: Player) => (
              <Link key={player.user_id} href={`/players/${player.user_id}`} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, backgroundColor: 'var(--muted)', padding: '12px 14px', borderRadius: 16, cursor: 'pointer' }}>
                  {player.users?.photo_url ? (
                    <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', border: '2px solid #3A3A3C', flexShrink: 0 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={player.users.photo_url} alt={player.users?.prenom || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--foreground)', fontSize: 16, fontWeight: 600, flexShrink: 0 }}>
                      {player.users?.prenom?.charAt(0) || 'P'}
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--foreground)' }}>{player.users?.prenom} {player.users?.nom?.charAt(0)}.</p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--muted-foreground)' }}>Niveau: {player.users?.niveau || 'N/A'}</p>
                  </div>
                  {player.user_id === party.createur_id && (
                    <span style={{ background: '#f2c991', color: 'var(--foreground)', fontSize: 9, fontWeight: 700, padding: '3px 10px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Orga
                    </span>
                  )}
                </div>
              </Link>
            ))}
            
            {/* Emplacements vides */}
            {Array.from({ length: Math.max(0, 4 - playerCount) }).map((_, i) => (
              <div key={`empty-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 16, border: '1.5px dashed #3A3A3C' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px dashed #3A3A3C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke='var(--border)' strokeWidth={2}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /></svg>
                </div>
                <span style={{ fontSize: 14, color: 'var(--border)', fontStyle: 'italic' }}>Place disponible</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
