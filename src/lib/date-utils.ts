/**
 * Utilitaire de dates — tout est calé sur Europe/Paris (UTC+1 / UTC+2 DST).
 * Utiliser ces helpers partout dans l'app au lieu des appels bruts à
 * toLocaleDateString / toLocaleTimeString / toLocaleString.
 */

const TZ = 'Europe/Paris'
const LOCALE = 'fr-FR'

/** "lun. 28 avr." */
export function formatDate(iso: string): string {
  const d = new Date(iso)
  const nowParis = new Date(new Date().toLocaleString('en-US', { timeZone: TZ }))
  const dParis = new Date(d.toLocaleString('en-US', { timeZone: TZ }))

  const today = new Date(nowParis)
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  dParis.setHours(0, 0, 0, 0)

  if (dParis.getTime() === today.getTime()) return "Aujourd'hui"
  if (dParis.getTime() === tomorrow.getTime()) return 'Demain'

  return d.toLocaleDateString(LOCALE, {
    timeZone: TZ,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

/** "14:30" */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(LOCALE, {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** "28/04 · 14:30" */
export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString(LOCALE, {
    timeZone: TZ,
    day: '2-digit',
    month: '2-digit',
  })
}

/** "28/04 · 14:30" (date + heure combinés) */
export function formatDatetime(iso: string): string {
  return new Date(iso).toLocaleString(LOCALE, {
    timeZone: TZ,
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Renvoie la date minimale (aujourd'hui) au format YYYY-MM-DD selon Paris.
 * À utiliser pour l'attribut `min` des <input type="date">.
 */
export function todayParis(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: TZ }) // en-CA donne YYYY-MM-DD
}

/**
 * Convertit une paire (date: "YYYY-MM-DD", time: "HH:MM") saisie en heure
 * de Paris en timestamp ISO UTC correct.
 * Ex: "2025-06-01" + "14:30" → "2025-06-01T12:30:00.000Z" (CEST UTC+2)
 */
export function parisLocalToISO(date: string, time: string): string {
  // Construit une chaîne interprétable par Temporal-like trick via Intl
  // On utilise la méthode fiable : créer une date UTC puis décaler l'offset Paris
  const naive = `${date}T${time}:00`
  // Récupère l'offset Paris pour ce moment-là (prend en compte l'heure d'été)
  const utcDate = new Date(naive + 'Z') // interprété UTC d'abord
  const parisStr = utcDate.toLocaleString('sv-SE', { timeZone: TZ }) // "YYYY-MM-DD HH:MM:SS"
  const diff = (new Date(naive).getTime() - new Date(parisStr.replace(' ', 'T')).getTime())
  return new Date(new Date(naive).getTime() - diff).toISOString()
}
