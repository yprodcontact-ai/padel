'use client'

import { usePathname } from 'next/navigation'

export function TopHeader() {
    const pathname = usePathname()

    /* ─── Hide on auth/onboarding pages and homepage ─── */
    const hiddenPaths = ['/', '/login', '/register', '/forgot-password', '/onboarding']
    if (hiddenPaths.includes(pathname)) return null

    /* ─── Empty 45px spacer for all other pages ─── */
    return (
        <div
            className="pt-safe"
            style={{
                height: 45,
                width: '100%',
                flexShrink: 0,
                backgroundColor: '#F2F2F7',
            }}
        />
    )
}
