import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: authData } = await supabase.auth.getUser()
    
    if (!authData.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { subscription } = await req.json()

    if (!subscription || !subscription.endpoint) {
        return NextResponse.json({ error: 'Subscription invalide' }, { status: 400 })
    }

    const payload = {
        user_id: authData.user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth
    }

    const { error } = await supabase
       .from('push_subscriptions')
       .upsert(payload, { onConflict: 'endpoint' })

    if (error) {
        console.error("DB Insert Push Subscription Error:", error)
        throw error
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
