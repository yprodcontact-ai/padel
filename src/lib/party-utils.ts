import { createClient } from '@/lib/supabase/server'

/**
 * Checks if a user is already participating in an upcoming or currently running party.
 * A user is considered "active" if they are 'inscrit' in a party whose start time
 * is strictly greater than 5 minutes ago.
 */
export async function checkUserActiveParty(userId: string): Promise<boolean> {
  const supabase = createClient()
  
  // threshold = 5 minutes ago
  const threshold = new Date(Date.now() - 5 * 60000).toISOString()

  const { data, error } = await supabase
    .from('party_players')
    .select('party_id, parties!inner(date_heure, statut)')
    .eq('user_id', userId)
    .eq('statut', 'inscrit')
    .in('parties.statut', ['publiee', 'complete', 'confirmee'])
    .gt('parties.date_heure', threshold)
    .limit(1)

  if (error) {
    console.error('Error checking user active party:', error)
    // Fail closed or open? Better to fail open (false) so we don't accidentally lock the user permanently if there is a DB error.
    return false
  }

  return data && data.length > 0
}
