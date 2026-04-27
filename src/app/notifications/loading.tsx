import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', padding: '16px 16px 100px', fontFamily: 'var(--font-sans)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-8 w-40" />
        </div>
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>

      {/* Notifications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ backgroundColor: 'var(--card)', padding: '14px 16px', borderRadius: 20, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ flexShrink: 0, marginTop: 2 }}>
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            <div style={{ flex: 1 }}>
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-3" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
