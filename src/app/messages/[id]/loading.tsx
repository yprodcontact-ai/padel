import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-sans)' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', paddingTop: 'max(12px, env(safe-area-inset-top))', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--background)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-6 w-48" />
      </div>

      {/* Messages list */}
      <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: 24, overflow: 'hidden' }}>
        {/* Other person message */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', alignSelf: 'flex-start', maxWidth: '85%' }}>
          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
          <Skeleton className="h-16 w-64 rounded-2xl rounded-bl-sm" />
        </div>
        
        {/* My message */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', alignSelf: 'flex-end', maxWidth: '85%' }}>
          <Skeleton className="h-12 w-48 rounded-2xl rounded-br-sm" />
        </div>

        {/* Other person message */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', alignSelf: 'flex-start', maxWidth: '85%' }}>
          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
          <Skeleton className="h-12 w-40 rounded-2xl rounded-bl-sm" />
        </div>
      </div>

      {/* Input area */}
      <div className="pb-safe" style={{ flexShrink: 0, backgroundColor: 'var(--card)', borderTop: '1px solid var(--border)', padding: '12px 16px', paddingBottom: 130 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Skeleton className="h-11 flex-1 rounded-full" />
          <Skeleton className="h-11 w-11 rounded-full flex-shrink-0" />
        </div>
      </div>
    </div>
  )
}
