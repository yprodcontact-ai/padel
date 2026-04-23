import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ChatInterface } from '@/app/messages/[id]/chat-interface'
import { BackButtonSquare } from '@/components/back-button'

export const metadata = { title: 'Discussion | Padel' }

export default async function MessagePage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()
  const user = authData.user
  if (!user) redirect('/login')

  const { data: participant } = await supabase.from('conversation_participants').select('*').eq('conversation_id', params.id).eq('user_id', user.id).single()
  if (!participant) redirect('/')

  const { data: initialMessages } = await supabase.from('messages').select(`id, contenu, created_at, sender_id, users ( prenom, photo_url )`).eq('conversation_id', params.id).order('created_at', { ascending: true })

  const { data: convInfo } = await supabase.from('conversations').select('party_id').eq('id', params.id).single()
  let chatTitle = 'Discussion de Groupe'
  if (convInfo?.party_id) {
    const { data: partyData } = await supabase.from('parties').select('date_heure').eq('id', convInfo.party_id).single()
    if (partyData?.date_heure) {
      const d = new Date(partyData.date_heure)
      const dateStr = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
      const timeStr = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      chatTitle = `Match : ${dateStr} - ${timeStr}`
    }
  }

  const formattedMessages = (initialMessages || []).map((m: Record<string, unknown>) => ({
    id: m.id as string, contenu: m.contenu as string, created_at: m.created_at as string, sender_id: m.sender_id as string,
    senderData: m.users as { prenom: string, photo_url: string } | null
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--background)', position: 'relative' }}>
      {/* HEADER */}
      <div style={{ backgroundColor: 'var(--card)', borderBottom: '1px solid #2C2C2E', padding: '14px 16px', zIndex: 20, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ marginRight: 12 }}>
          <BackButtonSquare />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: 'var(--foreground)', fontFamily: 'var(--font-sans)' }}>{chatTitle}</h1>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
            En direct
          </p>
        </div>
      </div>
      <ChatInterface conversationId={params.id} initialMessages={formattedMessages} currentUserId={user.id} />
    </div>
  )
}
