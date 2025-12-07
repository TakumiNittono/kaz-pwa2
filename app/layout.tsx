import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import './globals.css'
import Script from 'next/script'
import PWAInstall from './pwa-install'
import RegisterSW from './register-sw'

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Coaching Notification App',
  description: 'Receive push notifications and continue learning',
  manifest: '/manifest.json',
  themeColor: '#00f0ff',
  icons: {
    icon: '/icon.svg',
    apple: '/icon-180.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Coaching Notification App',
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
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/icon-180.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-180.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Coaching Notification App" />
      </head>
      <body className={notoSansJP.className}>
        <Script
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          strategy="afterInteractive"
        />
        {appId && (
          <Script id="onesignal-init" strategy="afterInteractive">
            {`
              window.OneSignalDeferred = window.OneSignalDeferred || [];
              OneSignalDeferred.push(async function(OneSignal) {
                try {
                  await OneSignal.init({
                    appId: "${appId}",
                    allowLocalhostAsSecureOrigin: true,
                    serviceWorkerParam: { scope: "/" },
                    serviceWorkerPath: "/OneSignalSDKWorker.js",
                  });
                } catch (error) {
                  console.error('OneSignal initialization error:', error);
                }
              });
            `}
          </Script>
        )}
        {children}
        <PWAInstall />
        <RegisterSW />
      </body>
    </html>
  )
}

