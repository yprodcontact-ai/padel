import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', paddingBottom: 130, fontFamily: 'var(--font-sans)' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 16px 0' }}>
        
        {/* Back link */}
        <div style={{ marginBottom: 20 }}>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>

        {/* Info Card */}
        <div style={{ backgroundColor: 'var(--card)', borderRadius: 28, padding: 24, border: '1px solid var(--border)', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <Skeleton className="h-8 w-40 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-8 w-16 rounded-full" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-5 w-32" />
          </div>
          
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>

        {/* Map Placeholder */}
        <Skeleton className="w-full h-[180px] rounded-3xl mb-6" />

        {/* Players Card */}
        <div style={{ backgroundColor: 'var(--card)', borderRadius: 28, padding: 24, border: '1px solid var(--border)' }}>
          <Skeleton className="h-6 w-32 mb-6" />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Skeleton className="h-[46px] w-[46px] rounded-full flex-shrink-0" />
                <div style={{ flex: 1 }}>
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
