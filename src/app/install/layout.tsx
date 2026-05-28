import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Installer WizzPadel | Padel',
}

export default function InstallLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
