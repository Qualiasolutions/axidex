import React from "react"
import type { Metadata } from 'next'
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair' });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: '--font-jetbrains' });

export const metadata: Metadata = {
  title: 'Axidex - Signal Intelligence Platform',
  description: 'Turn buying signals into revenue. Axidex detects hiring, funding, and expansion signals in real-time with AI-powered outreach.',
  metadataBase: new URL('https://axidex.vercel.app'),
  keywords: ['sales intelligence', 'buying signals', 'AI outreach', 'lead generation', 'sales automation'],
  authors: [{ name: 'Axidex' }],
  creator: 'Axidex',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://axidex.vercel.app',
    title: 'Axidex - Signal Intelligence Platform',
    description: 'Turn buying signals into revenue with AI-powered signal detection and smart outreach.',
    siteName: 'Axidex',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Axidex - Signal Intelligence Platform',
    description: 'Turn buying signals into revenue with AI-powered signal detection.',
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background text-foreground selection:bg-accent selection:text-accent-foreground overflow-x-hidden`}>
        {children}
        <Analytics />
        <Toaster />
      </body>
    </html>
  )
}
