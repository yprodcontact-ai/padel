import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', paddingBottom: 130, fontFamily: 'var(--font-sans)' }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, backgroundColor: 'var(--background)', borderBottom: '1px solid var(--border)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Skeleton className="h-[44px] w-[44px] rounded-xl" />
        <Skeleton className="h-6 w-40" />
      </div>

      <div style={{ padding: '20px 16px' }}>
        {/* FILTERS COMPONENT SKELETON */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <Skeleton className="h-10 w-1/3 rounded-full" />
            <Skeleton className="h-10 w-1/3 rounded-full" />
            <Skeleton className="h-10 w-1/3 rounded-full" />
          </div>
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>

        {/* RESULTS SKELETON */}
        <div style={{ marginTop: 28 }}>
          <div style={{ marginBottom: 16 }}>
            <Skeleton className="h-6 w-32" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ backgroundColor: 'var(--card)', borderRadius: 24, padding: '20px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-8 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-40 mb-4" />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div style={{ display: 'flex' }}>
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-10 w-10 rounded-full -ml-2" />
                  </div>
                  <Skeleton className="h-10 w-24 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
