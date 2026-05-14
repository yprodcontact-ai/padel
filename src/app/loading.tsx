import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', paddingBottom: 130 }}>
      {/* ═══ HERO HEADER ═══ */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '84px 20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Skeleton className="h-14 w-14 rounded-full" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Skeleton className="h-[52px] w-[80px] rounded-full" />
          <Skeleton className="h-[52px] w-[52px] rounded-full" />
        </div>
      </div>

      {/* ═══ MAIN TITLE ═══ */}
      <div style={{ padding: '0 20px', marginBottom: 28 }}>
        <Skeleton className="h-10 w-3/4 mb-2" />
        <Skeleton className="h-10 w-1/2" />
      </div>

      {/* ═══ VOTRE PROCHAINE PARTIE ═══ */}
      <div style={{ padding: '0 16px', marginBottom: 36 }}>
        <div style={{ backgroundColor: 'var(--card)', borderRadius: 28, padding: '24px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <Skeleton className="h-8 w-40 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-10 w-20 rounded-full" />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28 }}>
            <Skeleton className="h-2 w-2 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex' }}>
              <Skeleton className="h-[50px] w-[50px] rounded-full" />
              <Skeleton className="h-[50px] w-[50px] rounded-full -ml-3" />
              <Skeleton className="h-[50px] w-[50px] rounded-full -ml-3" />
              <Skeleton className="h-[50px] w-[50px] rounded-full -ml-3" />
            </div>
            <Skeleton className="h-11 w-24 rounded-full" />
          </div>
        </div>
      </div>

      {/* ═══ PARTIES DISPONIBLES ═══ */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', marginBottom: 16 }}>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>

        <div style={{ display: 'flex', gap: 16, overflowX: 'hidden', paddingLeft: 16, paddingRight: 32, paddingBottom: 32 }}>
          {[1, 2].map((i) => (
            <div key={i} style={{ minWidth: 280, width: 280, backgroundColor: 'var(--card)', borderRadius: 28, padding: '24px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <Skeleton className="h-8 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-10 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-36 mb-7" />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex' }}>
                  <Skeleton className="h-[50px] w-[50px] rounded-full" />
                  <Skeleton className="h-[50px] w-[50px] rounded-full -ml-3" />
                </div>
                <Skeleton className="h-11 w-11 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
