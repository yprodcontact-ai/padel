'use client'

interface SharePartyButtonProps {
  dateStr: string
  timeStr: string
  niveauMin: number
  niveauMax: number
  placesRestantes: number
  partyId: string
}

export function SharePartyButton({ dateStr, timeStr, niveauMin, niveauMax, placesRestantes, partyId }: SharePartyButtonProps) {
  const handleShare = async () => {
    const shareText = `🎾 Padel prévu le ${dateStr} à ${timeStr}
Niveaux acceptés : ${niveauMin} à ${niveauMax}
Places restantes : ${placesRestantes}

Rejoins-nous sur WizzPadel :
${window.location.origin}/parties/${partyId}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Partie de Padel',
          text: shareText,
        })
      } catch (err) {
        console.error('Erreur lors du partage :', err)
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText)
        alert('Lien et infos copiés dans le presse-papier !')
      } catch (err) {
        console.error('Erreur de copie :', err)
      }
    }
  }

  return (
    <button 
      onClick={handleShare}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 6, 
        height: 34, 
        padding: '0 14px', 
        borderRadius: 999, 
        backgroundColor: '#fff', 
        border: '1px solid var(--card-border)', 
        fontSize: 13, 
        fontWeight: 600, 
        color: 'var(--ink)', 
        cursor: 'pointer' 
      }}
    >
      Partager
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    </button>
  )
}
