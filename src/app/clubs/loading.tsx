import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', paddingBottom: 130, fontFamily: 'var(--font-sans)' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 20, backgroundColor: 'var(--background)', borderBottom: '1px solid var(--border)', padding: '64px 20px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Skeleton className="h-[44px] w-[44px] rounded-xl" />
        <Skeleton className="h-6 w-40" />
      </div>

      <div style={{ padding: '16px 20px' }}>
        <Skeleton className="h-12 w-full rounded-2xl mb-6" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ backgroundColor: 'var(--card)', borderRadius: 20, padding: 16, border: '1px solid var(--border)' }}>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
