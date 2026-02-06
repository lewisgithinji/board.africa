import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { NetworkStatusMonitor } from '@/components/NetworkStatusMonitor'
import { ClientInit } from '@/components/ClientInit'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Board.Africa - Corporate Governance & Board Management Platform',
  description: 'Africa\'s leading platform for board excellence and corporate governance leadership',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // suppressHydrationWarning: Prevents warning about data-scroll-behavior attribute
    // This is safe - Next.js adds this dynamically and it's expected
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={inter.className}>
        {/* Note: Browser extensions (password managers) inject attributes like 
            'fdprocessedid' into forms, causing hydration warnings. These are 
            FALSE POSITIVES and safe to ignore. Real hydration bugs in your 
            components will still show up. If you see hydration warnings in 
            specific components, investigate those - they're likely real bugs. */}
        {children}
        <Toaster position="top-right" richColors />
        <NetworkStatusMonitor />
        <ClientInit />
      </body>
    </html>
  )
}
