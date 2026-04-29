import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PartyActionButtons } from './party-buttons'
import { BackButton } from '@/components/back-button'
import { SharePartyButton } from './share-button'
import { PendingRequests } from './pending-requests'
import { formatDatetime, formatTime, formatDate } from '@/lib/date-utils'
import { LevelStrip } from '@/components/ui/level-strip'

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
  const dateFullStr = formatDatetime(party.date_heure)

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
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <h1 style={{ margin: 0, fontSize: 40, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-1.6px', lineHeight: 1 }}>
              {dateStr}
            </h1>
            <div style={{ height: 38, padding: '0 16px', borderRadius: 999, border: '1px solid var(--card-border)', background: 'var(--card)', display: 'flex', alignItems: 'center', fontSize: 16, fontWeight: 500, color: 'var(--ink)', flexShrink: 0 }}>
              {timeStr}
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 15, fontStyle: 'italic', color: 'var(--muted)' }}>{dateFullStr}</p>
        </div>

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

        {/* ── Demandes en attente (créateur uniquement) ── */}
        {isCreator && pendingPlayers.length > 0 && (
          <PendingRequests partyId={party.id} pendingPlayers={pendingPlayers.map((p: Player) => ({ user_id: p.user_id, prenom: p.users?.prenom || '', nom: p.users?.nom || '', photo_url: p.users?.photo_url || null, niveau: p.users?.niveau || null }))} />
        )}

        {/* ── Section joueurs ── */}
        <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--card-border)', marginBottom: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--divider)' }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>Joueurs {playerCount}/4</h2>
          </div>

          {confirmedPlayers.map((player: Player, idx: number) => (
            <Link key={player.user_id} href={`/players/${player.user_id}`} style={{ display: 'block', textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderTop: idx === 0 ? 'none' : '1px solid var(--divider)' }}>
                {/* Avatar */}
                <div style={{ position: 'relative', width: 40, height: 40, flexShrink: 0, borderRadius: '50%', boxShadow: '0 0 0 2px #fff' }}>
                  {player.users?.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={player.users.photo_url} alt={player.users?.prenom || ''} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, oklch(0.62 0.14 220), oklch(0.42 0.13 250))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: 15 }}>
                      {player.users?.prenom?.charAt(0) || 'P'}
                    </div>
                  )}
                  <span style={{ position: 'absolute', bottom: -2, left: '50%', transform: 'translateX(-50%)', background: '#000', color: '#fff', borderRadius: 999, fontSize: 9, fontWeight: 600, padding: '1px 5px', border: '1.5px solid #fff', whiteSpace: 'nowrap', lineHeight: 1.4 }}>
                    {player.users?.niveau || '?'}
                  </span>
                </div>
                {/* Nom */}
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>
                    {player.users?.prenom} {player.users?.nom?.charAt(0)}.
                  </p>
                  {player.user_id === party.createur_id && (
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--accent)', fontWeight: 500 }}>Organisateur</p>
                  )}
                </div>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
              </div>
            </Link>
          ))}

          {/* Slots vides */}
          {Array.from({ length: Math.max(0, 4 - playerCount) }).map((_, i) => (
            <div key={`empty-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderTop: '1px solid var(--divider)' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px dashed #B5B5BA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 20, color: '#B5B5BA', fontWeight: 300 }}>+</span>
              </div>
              <span style={{ fontSize: 14, color: 'var(--muted)', fontStyle: 'italic' }}>Place libre</span>
            </div>
          ))}
        </div>

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
          />
        )}

        {/* Spacer explicite pour éviter le bug Safari du padding-bottom ignoré */}
        <div style={{ height: 120, flexShrink: 0 }} />

      </div>
    </div>
  )
}
