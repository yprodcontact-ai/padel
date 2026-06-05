import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PartyActionButtons } from './party-buttons'
import { BackButton } from '@/components/back-button'
import { SharePartyButton } from './share-button'
import { PendingRequests } from './pending-requests'
import { formatTime, formatDate } from '@/lib/date-utils'
import { LevelStrip } from '@/components/ui/level-strip'
import { PlayerList } from './player-list'
import { EditPartyDateTime } from './edit-datetime'

type Player = { user_id: string; statut: string; users: { prenom: string; nom: string; photo_url: string; niveau: number | string } | null }

export default async function PartyDetailsPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()
  const currentUserId = authData.user?.id

  const { data: party, error } = await supabase
    .from('parties')
    .select(`*, clubs (nom, ville), users:createur_id (prenom, nom, niveau, photo_url), party_players ( user_id, statut, users (prenom, nom, photo_url, niveau) )`)
    .eq('id', params.id)
    .single()

  if (error || !party) notFound()

  const { data: conversation } = await supabase.from('conversations').select('id').eq('party_id', params.id).single()

  let userLevel: number | null = null
  if (currentUserId) {
    const { data: userProfile } = await supabase.from('users').select('niveau').eq('id', currentUserId).single()
    userLevel = userProfile?.niveau ? parseFloat(userProfile.niveau) : null
  }

  const isCreator = currentUserId === party.createur_id
  const allPlayers = party.party_players || []
  const confirmedPlayers = allPlayers.filter((p: Player) => p.statut === 'inscrit')
  const pendingPlayers = allPlayers.filter((p: Player) => p.statut === 'en_attente')
  const isParticipant = confirmedPlayers.some((p: Player) => p.user_id === currentUserId)
  const isPending = pendingPlayers.some((p: Player) => p.user_id === currentUserId)
  const playerCount = confirmedPlayers.length
  const isBelowLevel = userLevel !== null && party.niveau_min !== null && userLevel < party.niveau_min

  const dateStr = formatDate(party.date_heure)
  const timeStr = formatTime(party.date_heure)

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', paddingBottom: 20 }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 16px' }}>

        {/* ── Top bar : back + partager ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '64px 0 20px' }}>
          <BackButton />
          <SharePartyButton 
            dateStr={dateStr}
            timeStr={timeStr}
            niveauMin={party.niveau_min}
            niveauMax={party.niveau_max}
            placesRestantes={Math.max(0, 4 - playerCount)}
            partyId={party.id}
          />
        </div>

        {/* ── Hero : date + heure + sous-titre ── */}
        <EditPartyDateTime partyId={party.id} currentDateTime={party.date_heure} isCreator={isCreator} />

        {/* ── Card club ── */}
        <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--card-border)', padding: '18px 20px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Tile noir */}
          <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" /></svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 2px', fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{party.clubs?.nom || 'Club inconnu'}</p>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>
              {party.clubs?.ville}
              {party.duree && ` · ${party.duree}`}
            </p>
          </div>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M9 7h8v8" /></svg>
        </div>

        {/* ── Card niveau accepté ── */}
        <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--card-border)', padding: '18px 20px', marginBottom: 14 }}>
          <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 500, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.2px' }}>Niveau accepté</p>
          <p style={{ margin: '0 0 14px', fontSize: 32, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-1px', lineHeight: 1 }}>
            {party.niveau_min} <span style={{ fontSize: 18, fontWeight: 400, color: 'var(--muted)' }}>à</span> {party.niveau_max}
          </p>
          <div style={{ overflowX: 'auto', scrollbarWidth: 'none' }}>
            <LevelStrip
              playerLevel={userLevel ?? undefined}
              minLevel={party.niveau_min}
              maxLevel={party.niveau_max}
              chipSize={32}
              gap={5}
            />
          </div>
        </div>

        {/* ── Mot de l'organisateur ── */}
        {party.commentaire && (
          <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--card-border)', padding: '18px 20px', marginBottom: 14 }}>
            <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 500, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.2px' }}>Mot de l&apos;organisateur</p>
            <p style={{ margin: 0, fontSize: 15, color: 'var(--ink)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
              {party.commentaire}
            </p>
          </div>
        )}

        {/* ── Demandes en attente (créateur uniquement) ── */}
        {isCreator && pendingPlayers.length > 0 && (
          <PendingRequests partyId={party.id} pendingPlayers={pendingPlayers.map((p: Player) => ({ user_id: p.user_id, prenom: p.users?.prenom || '', nom: p.users?.nom || '', photo_url: p.users?.photo_url || null, niveau: p.users?.niveau || null }))} />
        )}

        {/* ── Section joueurs ── */}
        <PlayerList
          confirmedPlayers={confirmedPlayers}
          partyId={party.id}
          creatorId={party.createur_id}
          isCreator={isCreator}
        />

        {/* ── Chat de la partie ── */}
        {isParticipant && conversation && (
          <Link href={`/messages/${conversation.id}`} style={{ display: 'block', textDecoration: 'none', marginBottom: 14 }}>
            <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--card-border)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-9l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" /></svg>
              </div>
              <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>Chat de la partie</span>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
            </div>
          </Link>
        )}

        {/* ── CTA flottant rejoindre/quitter ── */}
        {currentUserId && (
          <PartyActionButtons
            partyId={party.id}
            isCreator={isCreator}
            isParticipant={isParticipant}
            isPending={isPending}
            isBelowLevel={isBelowLevel}
            status={party.statut}
            playerCount={playerCount}
            creatorId={party.createur_id}
            players={confirmedPlayers.map((p: Player) => ({
              id: p.user_id,
              prenom: p.users?.prenom || '',
              nom: p.users?.nom || '',
              photo_url: p.users?.photo_url || null
            }))}
          />
        )}

        {/* Spacer explicite pour éviter le bug Safari du padding-bottom ignoré */}
        <div style={{ height: 160, flexShrink: 0 }} />

      </div>
    </div>
  )
}
