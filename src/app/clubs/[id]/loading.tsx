import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', fontFamily: 'var(--font-sans)' }}>
      {/* Header Image */}
      <div style={{ position: 'relative', height: 200, backgroundColor: 'var(--card)', width: '100%' }}>
        <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <Skeleton className="h-full w-full" />
      </div>

      {/* Content */}
      <div style={{ padding: '0 16px', marginTop: -32, position: 'relative', zIndex: 10, maxWidth: 480, margin: '-32px auto 0' }}>
        <div style={{ backgroundColor: 'var(--card)', borderRadius: 28, padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid var(--border)', marginBottom: 24 }}>
          <Skeleton className="h-8 w-64 mb-3" />
          <Skeleton className="h-5 w-48 mb-6" />
          
          <div style={{ display: 'flex', gap: 12 }}>
            <Skeleton className="h-12 flex-1 rounded-xl" />
            <Skeleton className="h-12 flex-1 rounded-xl" />
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--card)', borderRadius: 28, padding: 24, border: '1px solid var(--border)' }}>
          <Skeleton className="h-6 w-40 mb-6" />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1, 2].map((i) => (
              <div key={i}>
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
