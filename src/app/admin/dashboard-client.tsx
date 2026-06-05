'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { BackButton } from '@/components/back-button'
import { 
  Users, 
  Calendar, 
  Trophy, 
  Activity, 
  RefreshCw, 
  TrendingUp, 
  BarChart3, 
  MapPin, 
  Award,
  CircleDot
} from 'lucide-react'
import { updateClubBanner } from './actions'

// Types for stats structure
interface DashboardStats {
  summary: {
    total_users: number;
    total_parties: number;
    total_clubs: number;
    completion_rate: number;
  };
  parties_stats: {
    today: number;
    this_week: number;
    this_month: number;
  };
  sessions_stats: {
    today: { sessions: number; users: number };
    this_week: { sessions: number; users: number };
    this_month: { sessions: number; users: number };
  };
  parties_by_status: { status: string; count: number }[];
  parties_by_type: { type: string; count: number }[];
  top_clubs: { name: string; city: string; count: number }[];
  top_players: { nom: string | null; prenom: string | null; email: string; count: number }[];
  parties_trend: { date: string; count: number }[];
  sessions_trend: { date: string; sessions: number; users: number }[];
}

interface Club {
  id: string;
  nom: string;
  ville: string;
  banner_image_url: string | null;
  banner_destination_url: string | null;
}

interface DashboardClientProps {
  initialStats: DashboardStats;
  clubs: Club[];
  migrationRequired: boolean;
}

export function DashboardClient({ initialStats, clubs: initialClubs, migrationRequired }: DashboardClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'leaderboards' | 'banners'>('overview')
  
  // Banners tab states
  const [clubs, setClubs] = useState<Club[]>(initialClubs)
  const [savingClubId, setSavingClubId] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<Record<string, 'idle' | 'saving' | 'success' | 'error'>>({})

  // States for interactive SVG charts tooltips
  const [hoveredGameIdx, setHoveredGameIdx] = useState<number | null>(null)
  const [hoveredSessionIdx, setHoveredSessionIdx] = useState<number | null>(null)

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  const handleInputChange = (clubId: string, field: 'banner_image_url' | 'banner_destination_url', value: string) => {
    setClubs(prev => prev.map(c => c.id === clubId ? { ...c, [field]: value || null } : c))
    if (saveStatus[clubId] && saveStatus[clubId] !== 'idle') {
      setSaveStatus(prev => ({ ...prev, [clubId]: 'idle' }))
    }
  }

  const handleSaveBanner = async (clubId: string) => {
    const club = clubs.find(c => c.id === clubId)
    if (!club) return

    setSavingClubId(clubId)
    setSaveStatus(prev => ({ ...prev, [clubId]: 'saving' }))

    try {
      const res = await updateClubBanner(clubId, club.banner_image_url, club.banner_destination_url)
      if (res.success) {
        setSaveStatus(prev => ({ ...prev, [clubId]: 'success' }))
        setTimeout(() => {
          setSaveStatus(prev => ({ ...prev, [clubId]: 'idle' }))
        }, 3000)
      } else {
        setSaveStatus(prev => ({ ...prev, [clubId]: 'error' }))
      }
    } catch (err) {
      console.error(err)
      setSaveStatus(prev => ({ ...prev, [clubId]: 'error' }))
    } finally {
      setSavingClubId(null)
    }
  }

  const {
    summary,
    parties_stats,
    sessions_stats,
    parties_by_status,
    parties_by_type,
    top_clubs,
    top_players,
    parties_trend,
    sessions_trend,
  } = initialStats

  // Format date helper for tooltip
  const formatTooltipDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    } catch {
      return dateStr
    }
  }

  // Helper for generating line chart calculations
  const calculateLineChart = (
    data: { value: number; label: string }[],
    width: number,
    height: number,
    padding = { top: 20, bottom: 30, left: 40, right: 20 }
  ) => {
    if (!data || data.length === 0) return null

    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    const maxValue = Math.max(...data.map(d => d.value), 1)
    
    const points = data.map((d, i) => {
      const x = padding.left + (i / (data.length - 1)) * chartWidth
      const y = padding.top + chartHeight - (d.value / maxValue) * chartHeight
      return { x, y, value: d.value, label: d.label }
    })

    const linePath = points.reduce((path, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`
    }, '')

    const areaPath = points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`
      : ''

    return { points, linePath, areaPath, maxValue, chartWidth, chartHeight }
  }

  // Preparations for charts
  const gameTrendData = (parties_trend || []).map(t => ({ value: t.count, label: t.date }))
  const sessionTrendData = (sessions_trend || []).map(t => ({ value: t.sessions, label: t.date }))
  const userTrendData = (sessions_trend || []).map(t => ({ value: t.users, label: t.date }))

  const gameChart = calculateLineChart(gameTrendData, 500, 180)
  const sessionChart = calculateLineChart(sessionTrendData, 500, 180)
  const userChart = calculateLineChart(userTrendData, 500, 180)

  // Status mapping to French and colors
  const statusLabels: Record<string, { label: string; color: string }> = {
    publiee: { label: 'Publiée', color: '#007AFF' },
    complete: { label: 'Complète', color: '#FF9500' },
    confirmee: { label: 'Confirmée', color: '#19A66B' },
    annulee: { label: 'Annulée', color: '#FF3B30' },
  }

  const typeLabels: Record<string, { label: string; color: string }> = {
    loisir: { label: 'Loisir', color: '#8E5AF7' },
    match: { label: 'Match', color: '#19A66B' },
    entrainement: { label: 'Entraînement', color: '#FF9500' },
  }

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', padding: '0 16px 40px', fontFamily: 'var(--font-family-sans)' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        
        {/* ── HEADER ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '64px 0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <BackButton />
            <div>
              <span style={{ display: 'block', fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>Backoffice</span>
              <h1 style={{ display: 'block', fontSize: 22, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.5px', margin: 0 }}>Tableau de bord</h1>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isPending}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: 'var(--card)',
              border: '1px solid var(--card-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              opacity: isPending ? 0.6 : 1,
              transition: 'all 0.2s',
            }}
          >
            <RefreshCw 
              style={{ 
                width: 16, 
                height: 16, 
                color: 'var(--ink)', 
                animation: isPending ? 'spin 1s linear infinite' : 'none' 
              }} 
            />
          </button>
        </div>

        {/* ── KPI CARDS GRID ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, marginBottom: 20 }}>
          
          <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-card)', padding: '20px 18px', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.2px' }}>Joueurs</span>
              <div style={{ background: 'rgba(25,166,107,0.1)', padding: 6, borderRadius: '50%' }}>
                <Users style={{ width: 16, height: 16, color: 'var(--accent)' }} />
              </div>
            </div>
            <p style={{ margin: 0, fontSize: 32, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-1px' }}>
              {summary.total_users}
            </p>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Inscrits au total</span>
          </div>

          <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-card)', padding: '20px 18px', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.2px' }}>Parties</span>
              <div style={{ background: 'rgba(255,149,0,0.1)', padding: 6, borderRadius: '50%' }}>
                <Calendar style={{ width: 16, height: 16, color: '#FF9500' }} />
              </div>
            </div>
            <p style={{ margin: 0, fontSize: 32, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-1px' }}>
              {summary.total_parties}
            </p>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Créées au total</span>
          </div>

          <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-card)', padding: '20px 18px', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.2px' }}>Clubs</span>
              <div style={{ background: 'rgba(0,122,255,0.1)', padding: 6, borderRadius: '50%' }}>
                <Trophy style={{ width: 16, height: 16, color: '#007AFF' }} />
              </div>
            </div>
            <p style={{ margin: 0, fontSize: 32, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-1px' }}>
              {summary.total_clubs}
            </p>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Clubs référencés</span>
          </div>

          <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-card)', padding: '20px 18px', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.2px' }}>Remplissage</span>
              <div style={{ background: 'rgba(142,90,247,0.1)', padding: 6, borderRadius: '50%' }}>
                <Activity style={{ width: 16, height: 16, color: '#8E5AF7' }} />
              </div>
            </div>
            <p style={{ margin: 0, fontSize: 32, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-1px' }}>
              {summary.completion_rate}%
            </p>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Parties complètes / confirmées</span>
          </div>

        </div>

        {/* ── TABS NAVIGATION ── */}
        <div style={{ display: 'flex', backgroundColor: '#E4E4E7', padding: 4, borderRadius: 14, marginBottom: 20 }}>
          {(['overview', 'trends', 'leaderboards', 'banners'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '10px 0',
                border: 'none',
                borderRadius: 11,
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                backgroundColor: activeTab === tab ? '#FFF' : 'transparent',
                color: activeTab === tab ? 'var(--ink)' : '#71717A',
                boxShadow: activeTab === tab ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {tab === 'overview' && 'Vue d\'ensemble'}
              {tab === 'trends' && 'Évolution & Sessions'}
              {tab === 'leaderboards' && 'Classements'}
              {tab === 'banners' && 'Publicité'}
            </button>
          ))}
        </div>

        {/* ── TAB CONTENT: OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* Grid parties & sessions (jour / semaine / mois) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
              
              {/* Box Parties Créées */}
              <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-card)', padding: 22, border: '1px solid var(--card-border)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar style={{ width: 18, height: 18, color: 'var(--accent)' }} />
                  Parties créées
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <div style={{ padding: 12, backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-tile)', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>24h</span>
                    <strong style={{ display: 'block', fontSize: 22, fontWeight: 700, color: 'var(--ink)', marginTop: 4 }}>
                      {parties_stats.today}
                    </strong>
                  </div>
                  <div style={{ padding: 12, backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-tile)', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>7 jours</span>
                    <strong style={{ display: 'block', fontSize: 22, fontWeight: 700, color: 'var(--ink)', marginTop: 4 }}>
                      {parties_stats.this_week}
                    </strong>
                  </div>
                  <div style={{ padding: 12, backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-tile)', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>30 jours</span>
                    <strong style={{ display: 'block', fontSize: 22, fontWeight: 700, color: 'var(--ink)', marginTop: 4 }}>
                      {parties_stats.this_month}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Box Sessions / Users uniques */}
              <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-card)', padding: 22, border: '1px solid var(--card-border)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Activity style={{ width: 18, height: 18, color: '#007AFF' }} />
                  Sessions &amp; Users uniques
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <div style={{ padding: '10px 6px', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-tile)', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>24h</span>
                    <strong style={{ display: 'block', fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginTop: 4 }}>
                      {sessions_stats.today.sessions} <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400 }}>sess.</span>
                    </strong>
                    <span style={{ display: 'block', fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
                      {sessions_stats.today.users} users
                    </span>
                  </div>
                  <div style={{ padding: '10px 6px', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-tile)', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>7 jours</span>
                    <strong style={{ display: 'block', fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginTop: 4 }}>
                      {sessions_stats.this_week.sessions} <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400 }}>sess.</span>
                    </strong>
                    <span style={{ display: 'block', fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
                      {sessions_stats.this_week.users} users
                    </span>
                  </div>
                  <div style={{ padding: '10px 6px', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-tile)', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>30 jours</span>
                    <strong style={{ display: 'block', fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginTop: 4 }}>
                      {sessions_stats.this_month.sessions} <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400 }}>sess.</span>
                    </strong>
                    <span style={{ display: 'block', fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
                      {sessions_stats.this_month.users} users
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Breakdown parties par status & types */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
              
              {/* Statuts des parties */}
              <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-card)', padding: 22, border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CircleDot style={{ width: 18, height: 18, color: '#FF9500' }} />
                  Statut des parties
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, justifyContent: 'center' }}>
                  {parties_by_status.length === 0 ? (
                    <span style={{ fontSize: 14, color: 'var(--muted)' }}>Aucune donnée disponible</span>
                  ) : (
                    parties_by_status.map((item) => {
                      const total = parties_by_status.reduce((acc, curr) => acc + curr.count, 0)
                      const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
                      const config = statusLabels[item.status] || { label: item.status, color: '#71717A' }
                      
                      return (
                        <div key={item.status}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 500, marginBottom: 5 }}>
                            <span style={{ color: 'var(--ink)' }}>{config.label}</span>
                            <span style={{ color: 'var(--muted)' }}>{item.count} ({pct}%)</span>
                          </div>
                          <div style={{ height: 8, width: '100%', backgroundColor: 'var(--bg)', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, backgroundColor: config.color, borderRadius: 4 }} />
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Types de parties */}
              <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-card)', padding: 22, border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BarChart3 style={{ width: 18, height: 18, color: '#8E5AF7' }} />
                  Types de parties
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, justifyContent: 'center' }}>
                  {parties_by_type.length === 0 ? (
                    <span style={{ fontSize: 14, color: 'var(--muted)' }}>Aucune donnée disponible</span>
                  ) : (
                    parties_by_type.map((item) => {
                      const total = parties_by_type.reduce((acc, curr) => acc + curr.count, 0)
                      const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
                      const config = typeLabels[item.type] || { label: item.type, color: '#71717A' }
                      
                      return (
                        <div key={item.type}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 500, marginBottom: 5 }}>
                            <span style={{ color: 'var(--ink)' }}>{config.label}</span>
                            <span style={{ color: 'var(--muted)' }}>{item.count} ({pct}%)</span>
                          </div>
                          <div style={{ height: 8, width: '100%', backgroundColor: 'var(--bg)', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, backgroundColor: config.color, borderRadius: 4 }} />
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ── TAB CONTENT: TRENDS & SESSIONS ── */}
        {activeTab === 'trends' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* Trend 1: Creation of Parties */}
            <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-card)', padding: 22, border: '1px solid var(--card-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <TrendingUp style={{ width: 18, height: 18, color: 'var(--accent)' }} />
                    Créations de parties (30 jours)
                  </h3>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>Évolution quotidienne des matchs organisés</span>
                </div>
                {hoveredGameIdx !== null && gameChart && (
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>
                      {gameChart.points[hoveredGameIdx].value} match{gameChart.points[hoveredGameIdx].value > 1 ? 'es' : ''}
                    </span>
                    <span style={{ display: 'block', fontSize: 10, color: 'var(--muted)' }}>
                      Le {formatTooltipDate(gameChart.points[hoveredGameIdx].label)}
                    </span>
                  </div>
                )}
              </div>

              {/* Chart SVG */}
              {gameChart ? (
                <div style={{ position: 'relative', width: '100%' }}>
                  <svg 
                    viewBox="0 0 500 180" 
                    style={{ width: '100%', height: 'auto', overflow: 'visible' }}
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const x = e.clientX - rect.left - 40
                      const idx = Math.round((x / gameChart.chartWidth) * (gameTrendData.length - 1))
                      if (idx >= 0 && idx < gameTrendData.length) {
                        setHoveredGameIdx(idx)
                      } else {
                        setHoveredGameIdx(null)
                      }
                    }}
                    onMouseLeave={() => setHoveredGameIdx(null)}
                  >
                    <defs>
                      <linearGradient id="gameGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                      const y = 20 + gameChart.chartHeight - ratio * gameChart.chartHeight
                      const labelValue = Math.round(ratio * gameChart.maxValue)
                      return (
                        <g key={i}>
                          <line x1={40} y1={y} x2={480} y2={y} stroke="var(--card-border)" strokeWidth={1} strokeDasharray="4 4" />
                          <text x={32} y={y + 4} fill="var(--muted)" fontSize={10} textAnchor="end">{labelValue}</text>
                        </g>
                      )
                    })}

                    {/* Gradient Area */}
                    <path d={gameChart.areaPath} fill="url(#gameGrad)" />
                    
                    {/* Main Line */}
                    <path d={gameChart.linePath} fill="none" stroke="var(--accent)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

                    {/* Active point indicator */}
                    {hoveredGameIdx !== null && (
                      <g>
                        <line 
                          x1={gameChart.points[hoveredGameIdx].x} 
                          y1={20} 
                          x2={gameChart.points[hoveredGameIdx].x} 
                          y2={150} 
                          stroke="var(--muted-2)" 
                          strokeWidth={1} 
                        />
                        <circle 
                          cx={gameChart.points[hoveredGameIdx].x} 
                          cy={gameChart.points[hoveredGameIdx].y} 
                          r={5} 
                          fill="var(--accent)" 
                          stroke="#fff" 
                          strokeWidth={1.5} 
                        />
                      </g>
                    )}
                    
                    {/* X-axis key dates labels */}
                    <text x={40} y={172} fill="var(--muted)" fontSize={9} textAnchor="start">
                      {formatTooltipDate(gameTrendData[0].label)}
                    </text>
                    <text x={260} y={172} fill="var(--muted)" fontSize={9} textAnchor="middle">
                      {formatTooltipDate(gameTrendData[Math.floor(gameTrendData.length / 2)].label)}
                    </text>
                    <text x={480} y={172} fill="var(--muted)" fontSize={9} textAnchor="end">
                      {formatTooltipDate(gameTrendData[gameTrendData.length - 1].label)}
                    </text>
                  </svg>
                </div>
              ) : (
                <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
                  Pas assez de données pour afficher le graphique
                </div>
              )}
            </div>

            {/* Trend 2: Sessions & Unique Users */}
            <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-card)', padding: 22, border: '1px solid var(--card-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Activity style={{ width: 18, height: 18, color: '#007AFF' }} />
                    Sessions &amp; Utilisateurs uniques (30 jours)
                  </h3>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>Comparatif visites uniques (bleu) vs comptes actifs (violet)</span>
                </div>
                {hoveredSessionIdx !== null && sessionChart && userChart && (
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#007AFF' }}>
                      {sessionChart.points[hoveredSessionIdx].value} session{sessionChart.points[hoveredSessionIdx].value > 1 ? 's' : ''}
                    </span>
                    <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8E5AF7' }}>
                      {userChart.points[hoveredSessionIdx].value} user{userChart.points[hoveredSessionIdx].value > 1 ? 's' : ''}
                    </span>
                    <span style={{ display: 'block', fontSize: 10, color: 'var(--muted)' }}>
                      Le {formatTooltipDate(sessionChart.points[hoveredSessionIdx].label)}
                    </span>
                  </div>
                )}
              </div>

              {/* Chart SVG */}
              {sessionChart && userChart ? (
                <div style={{ position: 'relative', width: '100%' }}>
                  <svg 
                    viewBox="0 0 500 180" 
                    style={{ width: '100%', height: 'auto', overflow: 'visible' }}
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const x = e.clientX - rect.left - 40
                      const idx = Math.round((x / sessionChart.chartWidth) * (sessionTrendData.length - 1))
                      if (idx >= 0 && idx < sessionTrendData.length) {
                        setHoveredSessionIdx(idx)
                      } else {
                        setHoveredSessionIdx(null)
                      }
                    }}
                    onMouseLeave={() => setHoveredSessionIdx(null)}
                  >
                    <defs>
                      <linearGradient id="sessGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#007AFF" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#007AFF" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8E5AF7" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#8E5AF7" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                      const y = 20 + sessionChart.chartHeight - ratio * sessionChart.chartHeight
                      // we scale session chart value as baseline
                      const labelValue = Math.round(ratio * sessionChart.maxValue)
                      return (
                        <g key={i}>
                          <line x1={40} y1={y} x2={480} y2={y} stroke="var(--card-border)" strokeWidth={1} strokeDasharray="4 4" />
                          <text x={32} y={y + 4} fill="var(--muted)" fontSize={10} textAnchor="end">{labelValue}</text>
                        </g>
                      )
                    })}

                    {/* Area Gradients */}
                    <path d={sessionChart.areaPath} fill="url(#sessGrad)" />
                    <path d={userChart.areaPath} fill="url(#userGrad)" />
                    
                    {/* Session line (blue) */}
                    <path d={sessionChart.linePath} fill="none" stroke="#007AFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    
                    {/* User line (purple) */}
                    <path d={userChart.linePath} fill="none" stroke="#8E5AF7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

                    {/* Interactive dot hover */}
                    {hoveredSessionIdx !== null && (
                      <g>
                        <line 
                          x1={sessionChart.points[hoveredSessionIdx].x} 
                          y1={20} 
                          x2={sessionChart.points[hoveredSessionIdx].x} 
                          y2={150} 
                          stroke="var(--muted-2)" 
                          strokeWidth={1} 
                        />
                        <circle 
                          cx={sessionChart.points[hoveredSessionIdx].x} 
                          cy={sessionChart.points[hoveredSessionIdx].y} 
                          r={4.5} 
                          fill="#007AFF" 
                          stroke="#fff" 
                          strokeWidth={1.5} 
                        />
                        <circle 
                          cx={userChart.points[hoveredSessionIdx].x} 
                          cy={userChart.points[hoveredSessionIdx].y} 
                          r={4.5} 
                          fill="#8E5AF7" 
                          stroke="#fff" 
                          strokeWidth={1.5} 
                        />
                      </g>
                    )}
                    
                    {/* X-axis labels */}
                    <text x={40} y={172} fill="var(--muted)" fontSize={9} textAnchor="start">
                      {formatTooltipDate(sessionTrendData[0].label)}
                    </text>
                    <text x={260} y={172} fill="var(--muted)" fontSize={9} textAnchor="middle">
                      {formatTooltipDate(sessionTrendData[Math.floor(sessionTrendData.length / 2)].label)}
                    </text>
                    <text x={480} y={172} fill="var(--muted)" fontSize={9} textAnchor="end">
                      {formatTooltipDate(sessionTrendData[sessionTrendData.length - 1].label)}
                    </text>
                  </svg>
                </div>
              ) : (
                <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
                  Pas assez de données pour afficher le graphique
                </div>
              )}
            </div>

          </div>
        )}

        {/* ── TAB CONTENT: LEADERBOARDS ── */}
        {activeTab === 'leaderboards' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            
            {/* Top Clubs */}
            <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-card)', padding: 22, border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin style={{ width: 18, height: 18, color: '#007AFF' }} />
                Clubs les plus actifs
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                {top_clubs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)', fontSize: 14 }}>
                    Aucune partie organisée dans des clubs
                  </div>
                ) : (
                  top_clubs.map((club, idx) => (
                    <div 
                      key={club.name} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        padding: '10px 12px', 
                        backgroundColor: 'var(--bg)', 
                        borderRadius: 'var(--radius-tile)',
                        border: '1px solid var(--card-border)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, maxWidth: '75%' }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : 'var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: idx < 3 ? '#000' : 'var(--muted)' }}>
                          {idx + 1}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {club.name}
                          </span>
                          <span style={{ display: 'block', fontSize: 11, color: 'var(--muted)' }}>
                            {club.city}
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{club.count}</span>
                        <span style={{ display: 'block', fontSize: 9, color: 'var(--muted)' }}>partie{club.count > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Top Players */}
            <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-card)', padding: 22, border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Award style={{ width: 18, height: 18, color: '#FF9500' }} />
                Joueurs les plus engagés
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                {top_players.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)', fontSize: 14 }}>
                    Aucun joueur enregistré dans une partie
                  </div>
                ) : (
                  top_players.map((player, idx) => {
                    const initials = `${player.prenom?.[0] || ''}${player.nom?.[0] || ''}`.toUpperCase() || 'P'
                    const fullname = player.prenom || player.nom 
                      ? `${player.prenom || ''} ${player.nom || ''}`.trim()
                      : player.email.split('@')[0]
                    
                    return (
                      <div 
                        key={player.email} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between', 
                          padding: '10px 12px', 
                          backgroundColor: 'var(--bg)', 
                          borderRadius: 'var(--radius-tile)',
                          border: '1px solid var(--card-border)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, maxWidth: '75%' }}>
                          <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : 'var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: idx < 3 ? '#000' : 'var(--muted)' }}>
                            {idx + 1}
                          </div>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'var(--ink-2)' }}>
                            {initials}
                          </div>
                          <div style={{ overflow: 'hidden' }}>
                            <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {fullname}
                            </span>
                            <span style={{ display: 'block', fontSize: 10, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {player.email}
                            </span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{player.count}</span>
                          <span style={{ display: 'block', fontSize: 9, color: 'var(--muted)' }}>rejointe{player.count > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB CONTENT: PUBLICITÉ (BANNIÈRES) ── */}
        {activeTab === 'banners' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {migrationRequired && (
              <div style={{ 
                backgroundColor: 'rgba(255,149,0,0.1)', 
                border: '1px solid #FF9500', 
                borderRadius: 'var(--radius-card)', 
                padding: 16, 
                color: 'var(--ink)',
                fontSize: 14,
                lineHeight: 1.5
              }}>
                <strong style={{ color: '#FF9500', display: 'block', marginBottom: 4 }}>Migration requise</strong>
                Les colonnes de base de données pour gérer les bannières publicitaires ne sont pas encore créées. Veuillez exécuter le fichier de migration <code>supabase/migrations/20260605170000_add_club_banners.sql</code> dans votre éditeur SQL Supabase pour activer la sauvegarde de cette fonctionnalité.
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {clubs.length === 0 ? (
                <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-card)', padding: '32px 20px', textAlign: 'center', border: '1px solid var(--card-border)' }}>
                  <p style={{ margin: 0, fontSize: 15, color: 'var(--muted)' }}>Aucun club trouvé pour le moment.</p>
                </div>
              ) : (
                clubs.map((club) => {
                  const currentImg = club.banner_image_url || '/images/padel_ad_banner.png'
                  const status = saveStatus[club.id] || 'idle'
                  
                  return (
                    <div key={club.id} style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius-card)', padding: 22, border: '1px solid var(--card-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.4px' }}>{club.nom}</h3>
                          <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--muted)' }}>{club.ville}</p>
                        </div>
                        <span style={{ fontSize: 11, backgroundColor: club.banner_image_url ? 'rgba(25,166,107,0.1)' : 'rgba(142,90,247,0.1)', color: club.banner_image_url ? 'var(--accent)' : '#8E5AF7', padding: '3px 8px', borderRadius: 999, fontWeight: 600 }}>
                          {club.banner_image_url ? 'Pub personnalisée' : 'Pub par défaut'}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
                        
                        {/* Live 2:1 Preview */}
                        <div>
                          <span style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--muted)', marginBottom: 8 }}>Aperçu de la bannière (Ratio 2:1)</span>
                          <div style={{ 
                            position: 'relative', 
                            width: '100%', 
                            maxWidth: 400,
                            aspectRatio: '2 / 1', 
                            borderRadius: 'var(--radius-card)', 
                            overflow: 'hidden',
                            border: '1px solid var(--card-border)',
                            backgroundColor: '#f4f4f5',
                          }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={currentImg} 
                              alt="Aperçu pub club" 
                              onError={(e) => {
                                e.currentTarget.src = '/images/padel_ad_banner.png'
                              }}
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover',
                              }} 
                            />
                            <span style={{ 
                              position: 'absolute', 
                              top: 8, 
                              right: 8, 
                              backgroundColor: '#ffffff', 
                              color: '#000000', 
                              fontSize: '9px', 
                              fontWeight: 600, 
                              padding: '2px 6px', 
                              borderRadius: '3px',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              pointerEvents: 'none',
                            }}>
                              publicité
                            </span>
                          </div>
                        </div>

                        {/* Input fields */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 6 }}>
                              Chemin ou URL de l&apos;image
                            </label>
                            <input 
                              type="text"
                              value={club.banner_image_url || ''}
                              onChange={(e) => handleInputChange(club.id, 'banner_image_url', e.target.value)}
                              placeholder="Ex: /images/padel_ad_banner.png ou https://..."
                              disabled={migrationRequired}
                              style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: 'var(--radius-tile)',
                                border: '1px solid var(--card-border)',
                                backgroundColor: 'var(--bg)',
                                color: 'var(--ink)',
                                fontSize: 14,
                                outline: 'none',
                                boxSizing: 'border-box',
                              }}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 6 }}>
                              URL de redirection au clic
                            </label>
                            <input 
                              type="text"
                              value={club.banner_destination_url || ''}
                              onChange={(e) => handleInputChange(club.id, 'banner_destination_url', e.target.value)}
                              placeholder="Ex: /parties ou https://..."
                              disabled={migrationRequired}
                              style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: 'var(--radius-tile)',
                                border: '1px solid var(--card-border)',
                                backgroundColor: 'var(--bg)',
                                color: 'var(--ink)',
                                fontSize: 14,
                                outline: 'none',
                                boxSizing: 'border-box',
                              }}
                            />
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                            <button
                              onClick={() => handleSaveBanner(club.id)}
                              disabled={migrationRequired || savingClubId === club.id}
                              style={{
                                padding: '10px 20px',
                                borderRadius: 'var(--radius-pill)',
                                backgroundColor: status === 'success' ? 'var(--accent)' : 'var(--ink)',
                                color: '#fff',
                                fontSize: 13,
                                fontWeight: 600,
                                border: 'none',
                                cursor: (migrationRequired || savingClubId === club.id) ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                transition: 'all 0.2s',
                                opacity: savingClubId === club.id ? 0.7 : 1,
                              }}
                            >
                              {status === 'saving' && 'Enregistrement...'}
                              {status === 'success' && 'Enregistré !'}
                              {status === 'error' && 'Erreur !'}
                              {status === 'idle' && 'Enregistrer'}
                            </button>

                            {status === 'success' && (
                              <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 500 }}>
                                La bannière a été mise à jour avec succès.
                              </span>
                            )}
                            {status === 'error' && (
                              <span style={{ fontSize: 13, color: '#FF3B30', fontWeight: 500 }}>
                                Erreur : veuillez vérifier la base de données.
                              </span>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </div>

      {/* Embedded Animations for loading & custom CSS */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
