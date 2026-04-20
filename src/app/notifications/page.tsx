import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BellIcon } from 'lucide-react'

export const metadata = {
  title: 'Notifications | Padel',
}

type AppNotification = {
  id: string;
  lien: string | null;
  lu: boolean;
  type: string;
  titre: string;
  contenu: string;
  payload: { message?: string };
  created_at: string;
}

export default async function NotificationsPage() {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()
  const user = authData?.user;

  if (!user) redirect('/login')

  // Marquer toutes les notifications comme lues à l'ouverture de la page
  await supabase
    .from('notifications')
    .update({ lu: true })
    .eq('user_id', user.id)
    .eq('lu', false)

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="flex flex-col min-h-screen bg-muted/10 p-4 pb-24">
      <h1 className="text-3xl font-black mb-6 flex items-center gap-2">
         <BellIcon className="w-8 h-8 text-primary" />
         Notifications
      </h1>

      {!notifications || notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center opacity-50 mt-20">
             <BellIcon className="w-16 h-16 mb-4" />
             <p>Vous n&apos;avez aucune notification.</p>
          </div>
      ) : (
          <div className="flex flex-col gap-3">
             {notifications.map((notif: AppNotification) => (
                <Link 
                   key={notif.id} 
                   href={notif.lien || '#'}
                   className={`bg-background border p-4 rounded-[16px] flex items-start gap-4 hover:bg-muted/50 transition-colors shadow-sm relative overflow-hidden ${!notif.lu ? 'border-primary/50' : ''}`}
                >
                    <div className="shrink-0 mt-1">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <BellIcon className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                    
                    <div className="flex-1">
                        <h3 className={`text-sm mb-1 ${!notif.lu ? 'font-black text-primary' : 'font-bold'}`}>
                            {notif.type === 'party_confirmed' ? 'Partie confirmée' : notif.type === 'party_cancelled' ? 'Partie annulée' : 'Nouvelle notification'}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            {notif.payload?.message || ''}
                        </p>
                        <span className="text-[10px] text-muted-foreground/60 mt-2 block font-medium">
                            {new Date(notif.created_at).toLocaleString('fr-FR', {
                                day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit'
                            })}
                        </span>
                    </div>
                </Link>
             ))}
          </div>
      )}
    </div>
  )
}
