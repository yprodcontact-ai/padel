'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { joinParty, leaveParty, updatePartyStatus, deleteParty, leavePartyAndTransfer } from './actions'

/**
 * PartyActionButtons — CTA flottant design handoff v2 + Admin features
 *
 * États couverts :
 *   - open  : 1+ place, bouton noir "Rejoindre"
 *   - full  : complet, bouton blanc bordé "Quitter"
 *   - below : niveau trop bas, bouton bordé "Demander à rejoindre"
 *   - pending/sent : état d'attente
 *   - creator : bouton de statut + actions d'administration (Supprimer / Quitter avec transfert)
 */

interface PlayerInfo {
  id: string
  prenom: string
  nom: string
  photo_url: string | null
}

interface PartyButtonsProps {
  partyId: string
  isCreator: boolean
  isParticipant: boolean
  isPending: boolean
  isBelowLevel: boolean
  status: string
  playerCount: number
  creatorId: string
  players?: PlayerInfo[]
}

export function PartyActionButtons({ partyId, isCreator, isParticipant, isPending, isBelowLevel, status, playerCount, creatorId, players }: PartyButtonsProps) {
  const router = useRouter()
  const [isPendingTransition, startTransition] = useTransition()
  const [errorText, setErrorText] = useState<string | null>(null)
  const [requestSent, setRequestSent] = useState(false)

  // États pour les modaux Admin
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteMessage, setDeleteMessage] = useState('')
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [selectedNewOrganizerId, setSelectedNewOrganizerId] = useState<string>('')

  const handleJoin = () => {
    setErrorText(null)
    startTransition(async () => {
      const res = await joinParty(partyId)
      if (res?.error) setErrorText(res.error)
      if (res?.status === 'en_attente') setRequestSent(true)
      else router.refresh()
    })
  }

  const handleLeave = () => {
    setErrorText(null)
    startTransition(async () => {
      const res = await leaveParty(partyId)
      if (res?.error) setErrorText(res.error)
      else router.refresh()
    })
  }

  const handleStatus = (action: 'confirm' | 'cancel') => {
    setErrorText(null)
    startTransition(async () => {
      const res = await updatePartyStatus(partyId, action)
      if (res?.error) setErrorText(res.error)
      else router.refresh()
    })
  }

  const handleDelete = () => {
    setErrorText(null)
    startTransition(async () => {
      const res = await deleteParty(partyId, deleteMessage)
      if (res?.error) {
        setErrorText(res.error)
        setShowDeleteModal(false)
      } else {
        router.push('/parties')
        router.refresh()
      }
    })
  }

  const handleLeaveAndTransfer = () => {
    if (!selectedNewOrganizerId) return
    setErrorText(null)
    startTransition(async () => {
      const res = await leavePartyAndTransfer(partyId, selectedNewOrganizerId)
      if (res?.error) {
        setErrorText(res.error)
        setShowLeaveModal(false)
      } else {
        setShowLeaveModal(false)
        router.refresh()
      }
    })
  }

  /* ── Styles de base ── */
  const btnBase: React.CSSProperties = {
    width: '100%',
    height: 52,
    borderRadius: 'var(--radius-card)',   // 28px
    border: 'none',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'opacity 0.15s ease',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
      {/* Style injecté pour les micro-animations iOS */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>

      {errorText && <p style={{ color: '#EF4444', fontSize: 13, textAlign: 'center', margin: 0 }}>{errorText}</p>}

      {/* ── Créateur en attente de complétion ── */}
      {isCreator && status === 'publiee' && (
        <button disabled style={{ ...btnBase, backgroundColor: 'var(--divider)', color: 'var(--muted)', cursor: 'default' }}>
          En attente ({playerCount}/4)
        </button>
      )}

      {/* ── Confirmation/annulation du terrain : tous les inscrits y ont accès ── */}
      {isParticipant && status === 'complete' && (
        <>
          <button onClick={() => handleStatus('confirm')} disabled={isPendingTransition} style={{ ...btnBase, backgroundColor: 'var(--accent)', color: '#fff', opacity: isPendingTransition ? 0.6 : 1 }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            Confirmer le terrain
          </button>
          <button onClick={() => handleStatus('cancel')} disabled={isPendingTransition} style={{ ...btnBase, backgroundColor: '#FFE8CC', border: '1px solid #FFD0A1', color: '#B45309', opacity: isPendingTransition ? 0.6 : 1 }}>
            Créneau non disponible
          </button>
        </>
      )}

      {/* ── Match confirmé (participant) ── */}
      {isParticipant && status === 'confirmee' && (
        <button disabled style={{ ...btnBase, backgroundColor: 'var(--accent)', color: '#fff', cursor: 'default' }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          Match confirmé
        </button>
      )}

      {/* ── Match annulé ── */}
      {isParticipant && status === 'annulee' && (
        <button disabled style={{ ...btnBase, backgroundColor: 'var(--divider)', color: 'var(--muted)', cursor: 'default' }}>
          Match annulé
        </button>
      )}

      {/* ── Participant non-créateur → Quitter (publiée OU complète : libère une place et rouvre la partie) ── */}
      {isParticipant && !isCreator && (status === 'publiee' || status === 'complete') && (
        <button onClick={handleLeave} disabled={isPendingTransition} style={{ ...btnBase, backgroundColor: 'var(--card)', border: '1px solid var(--card-border)', color: 'var(--ink)', opacity: isPendingTransition ? 0.6 : 1 }}>
          Quitter la partie
        </button>
      )}

      {/* ── Créateur / Administrateur → Actions secondaires (Quitter / Supprimer) ── */}
      {isCreator && (status === 'publiee' || status === 'complete') && (
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          {playerCount > 1 && (
            <button 
              onClick={() => {
                setSelectedNewOrganizerId('')
                setShowLeaveModal(true)
              }} 
              disabled={isPendingTransition} 
              style={{ ...btnBase, flex: 1, backgroundColor: 'var(--card)', border: '1px solid var(--card-border)', color: 'var(--ink)', opacity: isPendingTransition ? 0.6 : 1 }}
            >
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
              Quitter
            </button>
          )}
          <button 
            onClick={() => {
              setDeleteMessage('')
              setShowDeleteModal(true)
            }} 
            disabled={isPendingTransition} 
            style={{ ...btnBase, flex: 1, backgroundColor: 'transparent', border: '1px solid #FCA5A5', color: '#EF4444', opacity: isPendingTransition ? 0.6 : 1 }}
          >
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            Supprimer
          </button>
        </div>
      )}

      {/* ── Non-inscrit ── */}
      {!isParticipant && (
        <>
          {/* En attente de validation */}
          {(isPending || requestSent) && (
            <button disabled style={{ ...btnBase, backgroundColor: 'var(--divider)', color: 'var(--muted)', cursor: 'default' }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              Demande envoyée
            </button>
          )}

          {/* Rejoindre (open) ou Complet */}
          {!isPending && !requestSent && (
            <>
              {status === 'publiee' && playerCount < 4 ? (
                isBelowLevel ? (
                  /* Niveau insuffisant → demande */
                  <button onClick={handleJoin} disabled={isPendingTransition} style={{ ...btnBase, backgroundColor: 'transparent', border: '1.5px solid var(--ink)', color: 'var(--ink)', opacity: isPendingTransition ? 0.6 : 1 }}>
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
                    Demander à rejoindre
                  </button>
                ) : (
                  /* Rejoindre direct — bouton noir (état open) */
                  <button onClick={handleJoin} disabled={isPendingTransition} style={{ ...btnBase, backgroundColor: 'var(--ink)', color: '#fff', opacity: isPendingTransition ? 0.6 : 1 }}>
                    {isPendingTransition ? 'Chargement…' : 'Rejoindre la partie'}
                  </button>
                )
              ) : (
                /* Complet ou annulée */
                <button disabled style={{ ...btnBase, backgroundColor: 'var(--divider)', color: 'var(--muted)', cursor: 'default' }}>
                  {status === 'annulee' ? 'Partie annulée' : 'Partie complète'}
                </button>
              )}
            </>
          )}
        </>
      )}

      {/* ── Modal de Suppression ── */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ position: 'fixed', inset: 0 }} onClick={() => setShowDeleteModal(false)} />
          <div style={{ position: 'relative', width: '100%', maxWidth: 480, backgroundColor: 'var(--card)', border: '1px solid var(--card-border)', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, display: 'flex', flexDirection: 'column', gap: 16, zIndex: 1001, boxShadow: '0 -10px 40px rgba(0,0,0,0.15)', animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            
            {/* Barre de contrôle iOS */}
            <div style={{ width: 36, height: 5, backgroundColor: 'var(--divider)', borderRadius: 999, alignSelf: 'center', marginBottom: 4 }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>Annuler la partie ❌</h3>
              <button onClick={() => setShowDeleteModal(false)} style={{ background: 'var(--divider)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            
            <p style={{ margin: 0, fontSize: 14, color: 'var(--muted)', lineHeight: 1.5 }}>
              Êtes-vous sûr de vouloir supprimer cette partie ? Cette action est définitive.
            </p>

            {playerCount > 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>Message pour les joueurs (facultatif)</label>
                <textarea
                  value={deleteMessage}
                  onChange={(e) => setDeleteMessage(e.target.value)}
                  placeholder="Ex : Indisponibilité de terrain, mauvais temps..."
                  style={{
                    width: '100%',
                    height: 90,
                    borderRadius: 14,
                    border: '1px solid var(--card-border)',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--ink)',
                    padding: 12,
                    fontSize: 14,
                    fontFamily: 'var(--font-sans)',
                    resize: 'none',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button onClick={() => setShowDeleteModal(false)} style={{ ...btnBase, flex: 1, backgroundColor: 'transparent', border: '1px solid var(--card-border)', color: 'var(--ink)' }}>
                Conserver
              </button>
              <button 
                onClick={handleDelete} 
                disabled={isPendingTransition}
                style={{ ...btnBase, flex: 1, backgroundColor: '#EF4444', color: '#fff', opacity: isPendingTransition ? 0.6 : 1 }}
              >
                {isPendingTransition ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de Départ / Transfert ── */}
      {showLeaveModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ position: 'fixed', inset: 0 }} onClick={() => setShowLeaveModal(false)} />
          <div style={{ position: 'relative', width: '100%', maxWidth: 480, backgroundColor: 'var(--card)', border: '1px solid var(--card-border)', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, display: 'flex', flexDirection: 'column', gap: 16, zIndex: 1001, boxShadow: '0 -10px 40px rgba(0,0,0,0.15)', animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            
            {/* Barre de contrôle iOS */}
            <div style={{ width: 36, height: 5, backgroundColor: 'var(--divider)', borderRadius: 999, alignSelf: 'center', marginBottom: 4 }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>Désigner l&apos;organisateur 👑</h3>
              <button onClick={() => setShowLeaveModal(false)} style={{ background: 'var(--divider)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            
            <p style={{ margin: 0, fontSize: 14, color: 'var(--muted)', lineHeight: 1.5 }}>
              Pour quitter la partie, vous devez désigner un autre joueur inscrit comme nouvel organisateur.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
              {(players || [])
                .filter(p => p.id !== creatorId)
                .map(player => {
                  const isSelected = selectedNewOrganizerId === player.id
                  const initials = `${player.prenom[0] || ''}${player.nom[0] || ''}`.toUpperCase()
                  return (
                    <div 
                      key={player.id}
                      onClick={() => setSelectedNewOrganizerId(player.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 14px',
                        borderRadius: 16,
                        border: isSelected ? '1.5px solid var(--accent)' : '1px solid var(--card-border)',
                        backgroundColor: isSelected ? 'rgba(242, 201, 145, 0.08)' : 'var(--bg)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {player.photo_url ? (
                        <img src={player.photo_url} alt={`${player.prenom} ${player.nom}`} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--ink)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13 }}>
                          {initials}
                        </div>
                      )}
                      
                      <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>
                        {player.prenom} {player.nom}
                      </span>

                      <div style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        border: isSelected ? '2px solid var(--accent)' : '2px solid var(--muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxSizing: 'border-box'
                      }}>
                        {isSelected && (
                          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--accent)' }} />
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button onClick={() => setShowLeaveModal(false)} style={{ ...btnBase, flex: 1, backgroundColor: 'transparent', border: '1px solid var(--card-border)', color: 'var(--ink)' }}>
                Annuler
              </button>
              <button 
                onClick={handleLeaveAndTransfer} 
                disabled={isPendingTransition || !selectedNewOrganizerId}
                style={{ 
                  ...btnBase, 
                  flex: 1, 
                  backgroundColor: 'var(--ink)', 
                  color: '#fff', 
                  opacity: (isPendingTransition || !selectedNewOrganizerId) ? 0.6 : 1,
                  cursor: !selectedNewOrganizerId ? 'not-allowed' : 'pointer'
                }}
              >
                {isPendingTransition ? 'Transfert...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
