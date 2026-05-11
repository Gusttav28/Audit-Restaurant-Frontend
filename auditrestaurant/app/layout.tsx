import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { AppProvider } from '@/components/app-context'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Audit Coflow - Inventory & Audit Management',
  description: 'Professional restaurant audit and inventory management system',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/audit-coflow-logo-light.jpg',
      },
      {
        url: '/audit-coflow-logo-light.jpg',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/audit-coflow-logo-dark.jpg',
        media: '(prefers-color-scheme: dark)',
      },
    ],
    shortcut: '/audit-coflow-logo-light.jpg',
    apple: '/audit-coflow-logo-light.jpg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="auditflow-theme">
          <AppProvider>{children}</AppProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
