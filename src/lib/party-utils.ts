import { createClient } from '@/lib/supabase/server'

/**
 * Checks if a user has reached the maximum number of active parties (2).
 * A party is considered "active" if the user is 'inscrit' and its start time
 * is strictly greater than 5 minutes ago.
 */
export async function checkUserActiveParty(userId: string): Promise<boolean> {
  const supabase = createClient()
  
  // threshold = 5 minutes ago
  const threshold = new Date(Date.now() - 5 * 60000).toISOString()

  const { count, error } = await supabase
    .from('party_players')
    .select('party_id, parties!inner(date_heure, statut)', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('statut', 'inscrit')
    .in('parties.statut', ['publiee', 'complete', 'confirmee'])
    .gt('parties.date_heure', threshold)

  if (error) {
    console.error('Error checking user active party:', error)
    // Fail closed or open? Better to fail open (false) so we don't accidentally lock the user permanently if there is a DB error.
    return false
  }

  return count !== null && count >= 2
}
