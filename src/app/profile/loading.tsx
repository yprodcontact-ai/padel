import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', padding: '16px 16px 100px', fontFamily: 'var(--font-sans)' }}>
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>

        {/* Profile Card */}
        <div style={{ backgroundColor: 'var(--card)', borderRadius: 28, padding: '32px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Avatar */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <Skeleton className="h-[96px] w-[96px] rounded-full" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginBottom: 24 }}>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ backgroundColor: 'var(--muted)', borderRadius: 16, padding: '14px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left' }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderTop: '1px solid var(--border)' }}>
                <Skeleton className="h-6 w-6 rounded-full mt-1" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Logout */}
        <div style={{ marginTop: 32 }}>
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
