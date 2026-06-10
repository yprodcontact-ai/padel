'use client'

import { useState } from 'react'
import { PartyCard, PartyInfo } from '@/components/party-card'
import Link from 'next/link'

type Member = {
  id: string
  prenom: string | null
  nom: string | null
  photo_url: string | null
  niveau: number | null
  ville: string | null
}

type ClubTabsProps = {
  clubId: string
  description: string | null
  adresse: string | null
  ville: string
  telephone: string | null
  email: string | null
  parties: PartyInfo[]
  members: Member[]
}

export function ClubTabs({
  clubId,
  description,
  adresse,
  ville,
  telephone,
  email,
  parties,
  members,
}: ClubTabsProps) {
  const [activeTab, setActiveTab] = useState<'infos' | 'parties' | 'membres'>('infos')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredMembers = members.filter((member) => {
    const fullName = `${member.prenom || ''} ${member.nom || ''}`.toLowerCase()
    return fullName.includes(searchQuery.toLowerCase())
  })

  // Mock amenities for a premium visual presentation
  const amenities = [
    { label: 'Pistes Indoor & Outdoor', icon: '🎾' },
    { label: 'Club House & Bar', icon: '🍺' },
    { label: 'Location de Raquettes & Balles', icon: '🎒' },
    { label: 'Vestiaires & Douches', icon: '🚿' },
    { label: 'Parking gratuit', icon: '🚗' },
    { label: 'Coaching professionnel', icon: '🎓' },
  ]

  return (
    <div style={{ marginTop: 20 }}>
      {/* Tabs Header */}
      <div style={{
        display: 'flex',
        backgroundColor: '#E4E4E6',
        borderRadius: 14,
        padding: 4,
        marginBottom: 20,
      }}>
        {(['infos', 'parties', 'membres'] as const).map((tab) => {
          const isActive = activeTab === tab
          let label = ''
          let badgeCount = 0
          if (tab === 'infos') label = 'Infos'
          if (tab === 'parties') {
            label = 'Parties'
            badgeCount = parties.length
          }
          if (tab === 'membres') {
            label = 'Membres'
            badgeCount = members.length
          }

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: 10,
                border: 'none',
                backgroundColor: isActive ? 'var(--card)' : 'transparent',
                color: isActive ? 'var(--ink)' : 'var(--muted)',
                fontWeight: isActive ? 600 : 500,
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {label}
              {badgeCount > 0 && (
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  backgroundColor: isActive ? 'var(--ink)' : 'var(--muted-2)',
                  color: isActive ? '#fff' : 'var(--ink-2)',
                  padding: '2px 6px',
                  borderRadius: 999,
                  lineHeight: 1,
                }}>
                  {badgeCount}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div style={{ animation: 'fadeSimple 0.3s ease' }}>
        {activeTab === 'infos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Description */}
            <div style={{ backgroundColor: 'var(--card)', borderRadius: 20, padding: 20, border: '1px solid var(--card-border)' }}>
              <h3 style={{ margin: '0 0 10px', fontSize: 16, fontWeight: 600, color: 'var(--foreground)' }}>À propos</h3>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
                {description || 'Aucune description disponible pour ce club.'}
              </p>
            </div>

            {/* Services & Equipments */}
            <div style={{ backgroundColor: 'var(--card)', borderRadius: 20, padding: 20, border: '1px solid var(--card-border)' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 600, color: 'var(--foreground)' }}>Services & Équipements</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {amenities.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{item.icon}</span>
                    <span style={{ fontSize: 13, color: 'var(--foreground)', fontWeight: 500 }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact details */}
            <div style={{ backgroundColor: 'var(--card)', borderRadius: 20, padding: 20, border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: 'var(--foreground)' }}>Coordonnées</h3>
              {adresse && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke='var(--muted-foreground)' strokeWidth={2} style={{ marginTop: 2, flexShrink: 0 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  <span style={{ fontSize: 14, color: 'var(--foreground)' }}>{adresse}, {ville}</span>
                </div>
              )}
              {telephone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke='var(--muted-foreground)' strokeWidth={2} style={{ flexShrink: 0 }}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72" /></svg>
                  <a href={`tel:${telephone.replace(/\s+/g, '')}`} style={{ fontSize: 14, color: 'var(--ink)', textDecoration: 'none', fontWeight: 500 }}>{telephone}</a>
                </div>
              )}
              {email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke='var(--muted-foreground)' strokeWidth={2} style={{ flexShrink: 0 }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                  <a href={`mailto:${email}`} style={{ fontSize: 14, color: 'var(--ink)', textDecoration: 'none', fontWeight: 500 }}>{email}</a>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'parties' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {parties.length > 0 ? (
              parties.map((party) => (
                <PartyCard key={party.id} party={party} />
              ))
            ) : (
              <div style={{
                backgroundColor: 'var(--card)',
                borderRadius: 20,
                padding: '40px 20px',
                textAlign: 'center',
                border: '1px solid var(--card-border)',
              }}>
                <span style={{ fontSize: 32, display: 'block', marginBottom: 12 }}>🎾</span>
                <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--muted)', fontWeight: 500 }}>
                  Aucune partie n&apos;est prévue dans ce club.
                </p>
                <Link
                  href={`/parties/create?club_id=${clubId}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    height: 44,
                    padding: '0 20px',
                    borderRadius: 100,
                    backgroundColor: 'var(--ink)',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Créer une partie
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'membres' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Search Input */}
            {members.length > 0 && (
              <div>
                <input
                  type="text"
                  placeholder="Rechercher un membre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    height: 46,
                    borderRadius: 14,
                    border: '1px solid var(--card-border)',
                    backgroundColor: 'var(--card)',
                    color: 'var(--foreground)',
                    fontSize: 14,
                    padding: '0 16px',
                    outline: 'none',
                    fontFamily: 'var(--font-sans)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            )}

            {/* Grid display */}
            {filteredMembers.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
              }}>
                {filteredMembers.map((member) => {
                  const initials = `${member.prenom?.charAt(0) || ''}${member.nom?.charAt(0) || ''}`.toUpperCase()
                  return (
                    <Link
                      key={member.id}
                      href={`/players/${member.id}`}
                      style={{
                        backgroundColor: 'var(--card)',
                        borderRadius: 20,
                        padding: 16,
                        border: '1px solid var(--card-border)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        minWidth: 0,
                        textDecoration: 'none',
                        color: 'inherit',
                        cursor: 'pointer'
                      }}
                    >
                      {/* Avatar */}
                      <div style={{
                        position: 'relative',
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        marginBottom: 10,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      }}>
                        {member.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={member.photo_url}
                            alt={`${member.prenom} ${member.nom}`}
                            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, oklch(0.62 0.14 220), oklch(0.42 0.13 250))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: 18,
                          }}>
                            {initials || '?'}
                          </div>
                        )}
                        {member.niveau !== null && (
                          <span style={{
                            position: 'absolute',
                            bottom: -4,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            backgroundColor: 'var(--ink)',
                            color: '#fff',
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: 999,
                            border: '2px solid var(--card)',
                            lineHeight: 1,
                          }}>
                            {member.niveau}
                          </span>
                        )}
                      </div>

                      {/* Name */}
                      <span style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: 'var(--foreground)',
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        width: '100%',
                      }}>
                        {member.prenom} {member.nom}
                      </span>

                      {/* City */}
                      <span style={{
                        fontSize: 11,
                        color: 'var(--muted)',
                        display: 'block',
                        marginTop: 2,
                      }}>
                        {member.ville || '—'}
                      </span>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div style={{
                backgroundColor: 'var(--card)',
                borderRadius: 20,
                padding: '40px 20px',
                textAlign: 'center',
                border: '1px solid var(--card-border)',
              }}>
                <span style={{ fontSize: 32, display: 'block', marginBottom: 12 }}>🔍</span>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--muted)', fontWeight: 500 }}>
                  {members.length > 0
                    ? 'Aucun membre ne correspond à votre recherche.'
                    : 'Aucun membre n\'est enregistré dans ce club.'
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
