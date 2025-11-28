import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'コーチング通知アプリ',
  description: 'プッシュ通知を受け取って、学習を継続しましょう',
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
      <body className={inter.className}>
        <Script
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          strategy="afterInteractive"
        />
        <Script id="onesignal-init" strategy="afterInteractive">
          {`
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            OneSignalDeferred.push(async function(OneSignal) {
              await OneSignal.init({
                appId: "${appId}",
                allowLocalhostAsSecureOrigin: true,
                serviceWorkerParam: { scope: "/" },
                serviceWorkerPath: "/OneSignalSDKWorker.js",
              });
            });
          `}
        </Script>
        {children}
      </body>
    </html>
  )
}

