import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { AppProvider } from '@/components/app-context'
import './globals.css'

export const metadata: Metadata = {
  title: 'Audit Flow - Inventory & Audit Management',
  description: 'Professional restaurant audit and inventory management system',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <AppProvider>{children}</AppProvider>
        <Analytics />
      </body>
    </html>
  )
}
