import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { ThemeProvider } from '../components/theme-provider'
import { AuthProvider } from '../contexts/AuthContext'

export const metadata: Metadata = {
  title: 'Adventurers Guild',
  description: 'Created with Adventure',
  themeColor: '#ffffff',
  manifest: '/manifest.json',
  icons: {
    icon: '/pwa/icon-192x192.png',
    apple: '/pwa/icon-192x192.png',
  },
  generator: 'Adventurers',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`} >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}