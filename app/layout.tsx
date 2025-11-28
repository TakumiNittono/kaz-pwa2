import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Script from 'next/script'
import PWAInstall from './pwa-install'
import RegisterSW from './register-sw'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'コーチング通知アプリ',
  description: 'プッシュ通知を受け取って、学習を継続しましょう',
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'コーチング通知アプリ',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
}

declare global {
  interface Window {
    OneSignalDeferred?: Array<(...args: any[]) => void>
    OneSignal?: any
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || ''

  return (
    <html lang="ja">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="コーチング通知アプリ" />
      </head>
      <body className={inter.className}>
        {children}
        <PWAInstall />
        <RegisterSW />
      </body>
    </html>
  )
}

