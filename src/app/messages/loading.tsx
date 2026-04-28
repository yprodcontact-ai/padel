import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', padding: '16px 16px 130px', fontFamily: 'var(--font-sans)' }}>
      <h1 style={{ margin: '16px 0 24px', fontSize: 30, fontWeight: 800, color: 'var(--foreground)' }}>Messages</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ backgroundColor: 'var(--card)', padding: '14px 16px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 14, border: '1px solid var(--border)' }}>
            <div style={{ flexShrink: 0 }}>
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
            
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
