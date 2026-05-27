'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { excludePlayer } from './actions'

type Player = {
  user_id: string
  statut: string
  users: {
    prenom: string
    nom: string
    photo_url: string
    niveau: number | string
  } | null
}

interface PlayerListProps {
  confirmedPlayers: Player[]
  partyId: string
  creatorId: string
  isCreator: boolean
}

export function PlayerList({ confirmedPlayers, partyId, creatorId, isCreator }: PlayerListProps) {
  const [isPending, startTransition] = useTransition()
  const [selectedPlayer, setSelectedPlayer] = useState<{ id: string; name: string } | null>(null)
  const [message, setMessage] = useState('')

  const handleExcludeClick = (e: React.MouseEvent, playerId: string, playerName: string) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedPlayer({ id: playerId, name: playerName })
    setMessage('')
  }

  const handleConfirmExclude = () => {
    if (!selectedPlayer) return

    startTransition(async () => {
      const res = await excludePlayer(partyId, selectedPlayer.id, message.trim() || undefined)
      if (res && 'error' in res && res.error) {
        alert(res.error)
      } else {
        setSelectedPlayer(null)
      }
    })
  }

  return (
    <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--card-border)', marginBottom: 14, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--divider)' }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>Joueurs {confirmedPlayers.length}/4</h2>
      </div>

      {confirmedPlayers.map((player: Player, idx: number) => {
        const isSelfCreator = player.user_id === creatorId
        const canExclude = isCreator && !isSelfCreator

        return (
          <div key={player.user_id} style={{ position: 'relative', borderTop: idx === 0 ? 'none' : '1px solid var(--divider)' }}>
            <Link href={`/players/${player.user_id}`} style={{ display: 'block', textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', transition: 'background-color 0.2s' }} className="hover:bg-neutral-50">
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
                  {isSelfCreator && (
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--accent)', fontWeight: 500 }}>Organisateur</p>
                  )}
                </div>

                {/* Bouton exclusion (créateur uniquement, exclut lui-même) */}
                {canExclude ? (
                  <button
                    onClick={(e) => handleExcludeClick(e, player.user_id, player.users?.prenom || 'Joueur')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 59, 48, 0.1)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'transform 0.15s, background-color 0.15s',
                    }}
                    className="hover:scale-105 active:scale-95 hover:bg-[rgba(255,59,48,0.18)]"
                    title="Exclure ce joueur"
                  >
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                ) : (
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                )}
              </div>
            </Link>
          </div>
        )
      })}

      {/* Slots vides */}
      {Array.from({ length: Math.max(0, 4 - confirmedPlayers.length) }).map((_, i) => (
        <div key={`empty-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderTop: '1px solid var(--divider)' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px dashed #B5B5BA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 20, color: '#B5B5BA', fontWeight: 300 }}>+</span>
          </div>
          <span style={{ fontSize: 14, color: 'var(--muted)', fontStyle: 'italic' }}>Place libre</span>
        </div>
      ))}

      {/* Modal d'exclusion interactif de style Premium */}
      {selectedPlayer && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: 28,
            padding: 24,
            width: '100%',
            maxWidth: 360,
            border: '1px solid var(--card-border)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            transform: 'scale(1)',
            animation: 'scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.4px' }}>
              Exclure {selectedPlayer.name} ?
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--muted)', lineHeight: 1.4 }}>
              Vous pouvez ajouter un message d&apos;explication personnalisé que le joueur recevra avec sa notification.
            </p>

            <textarea
              placeholder="Ex: Désolé, le niveau requis n'est pas tout à fait atteint, à une prochaine !"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isPending}
              style={{
                width: '100%',
                height: 80,
                borderRadius: 14,
                border: '1px solid var(--stroke-soft)',
                padding: '12px 14px',
                fontSize: 14,
                fontFamily: 'inherit',
                resize: 'none',
                outline: 'none',
                marginBottom: 20,
                backgroundColor: 'var(--bg)'
              }}
            />

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setSelectedPlayer(null)}
                disabled={isPending}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 22,
                  border: '1px solid var(--card-border)',
                  backgroundColor: '#fff',
                  color: 'var(--ink)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmExclude}
                disabled={isPending}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 22,
                  border: 'none',
                  backgroundColor: '#FF3B30',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: isPending ? 0.7 : 1
                }}
              >
                {isPending ? 'Exclusion...' : 'Exclure'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
