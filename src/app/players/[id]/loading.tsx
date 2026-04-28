import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', padding: '16px 16px 130px', fontFamily: 'var(--font-sans)' }}>
      <div style={{ paddingTop: 8 }}>
        <Skeleton className="h-10 w-10 rounded-full mb-6" />
      </div>

      <div style={{ maxWidth: 420, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Skeleton className="h-32 w-32 rounded-full border-4 border-card mb-4" />
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-6 w-24 rounded-full mb-8" />

        <div style={{ width: '100%', backgroundColor: 'var(--card)', borderRadius: 24, padding: 24, border: '1px solid var(--border)' }}>
          <Skeleton className="h-6 w-32 mb-4" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div style={{ height: 1, backgroundColor: 'var(--border)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
