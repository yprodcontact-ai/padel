// @ts-expect-error: Could not find a declaration file for module 'web-push'
import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || ''

if (vapidPublicKey && vapidPrivateKey) {
  try {
      webpush.setVapidDetails(
        'mailto:contact@wizzpadel.com',
        vapidPublicKey,
        vapidPrivateKey
      )
  } catch {
      console.warn("VAPID Keys not configured completely yet.")
  }
}

// Utiliser l'ANON KEY car l'API est NextJS backend, mais l'idéal est SERVICE_ROLE pour ignorer les RLS
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // Si la SERVICE ROLE n'est pas définie, on bypass comme on peut ou on s'assure que le RLS Select l'autorise (fait dans notre schema)
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function sendPushNotification(userId: string, payload: { title: string, message: string, url?: string }) {
    if (!vapidPublicKey || !vapidPrivateKey) {
        console.warn("Web Push API non configurée. Impossible d'envoyer:", payload);
        return;
    }

    const { data: subs } = await supabaseAdmin
        .rpc('get_user_push_subscriptions', { p_user_id: userId })

    if (!subs || subs.length === 0) return;

    for (const sub of subs) {
        const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
                p256dh: sub.p256dh,
                auth: sub.auth
            }
        }
        try {
            await webpush.sendNotification(pushSubscription, JSON.stringify(payload))
        } catch (error: unknown) {
            const err = error as { statusCode?: number }
            console.error('Erreur Push Web:', error)
            // L'abonnement a expiré ou a été révoqué
            if (err.statusCode === 410 || err.statusCode === 404) {
               await supabaseAdmin.from('push_subscriptions').delete().eq('id', sub.id)
            }
        }
    }
}
