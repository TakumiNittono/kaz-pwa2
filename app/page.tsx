'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Bell, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

declare global {
  interface Window {
    OneSignalDeferred?: Array<(...args: any[]) => void>
    OneSignal?: any
  }
}

export default function Home() {
  const router = useRouter()
  const [isInitialized, setIsInitialized] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isPwa, setIsPwa] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // PWAモード判定
  useEffect(() => {
    const checkPwaMode = () => {
      // display-mode: standalone をチェック
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      
      // iOSのstandaloneモードをチェック
      const isIOSStandalone = (navigator as any).standalone === true
      
      // PWAとして開かれているか判定
      const pwaMode = isStandalone || isIOSStandalone
      setIsPwa(pwaMode)
    }

    // 初回チェック
    checkPwaMode()

    // メディアクエリの変更を監視（必要に応じて）
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    const handleChange = () => checkPwaMode()
    
    // メディアクエリの変更をリッスン（サポートされている場合）
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange)
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange)
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleChange)
      }
    }
  }, [])

  // OneSignal SDKの待機処理を共通化
  const waitForOneSignal = async (): Promise<void> => {
    await new Promise<void>((resolve) => {
      if (window.OneSignal) {
        resolve()
        return
      }
      window.OneSignalDeferred = window.OneSignalDeferred || []
      window.OneSignalDeferred.push(() => {
        resolve()
      })
    })
  }

  useEffect(() => {
    // PWAモードの時のみOneSignalの状態を確認
    if (!isPwa) return

    const checkOneSignalStatus = async () => {
      try {
        // OneSignal SDKが読み込まれるまで待機（layout.tsxで初期化される）
        await waitForOneSignal()

        // 少し待ってから状態を確認（初期化完了を待つ）
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // 既に通知が許可されているか確認
        try {
          if (window.OneSignal) {
            const permission = await window.OneSignal.Notifications.permissionNative
            if (permission) {
              setIsSubscribed(true)
            }
            setIsInitialized(true)
          }
        } catch (error) {
          // エラーは無視（ドメイン設定待ちのため）
          // ただし、初期化済みとして扱う（ボタンは有効化）
          setIsInitialized(true)
        }
      } catch (error) {
        // エラーは無視（ドメイン設定待ちのため）
        // ただし、初期化済みとして扱う（ボタンは有効化）
        setIsInitialized(true)
      }
    }

    checkOneSignalStatus()
  }, [isPwa])

  // 未読通知数を取得
  useEffect(() => {
    if (!isPwa || !isSubscribed) return

    const fetchUnreadCount = async () => {
      try {
        await waitForOneSignal()

        await new Promise((resolve) => setTimeout(resolve, 1000))

        if (!window.OneSignal) return

        let playerId: string | null = null
        try {
          playerId = await window.OneSignal.User.PushSubscription.id
        } catch (error) {
          return
        }

        if (!playerId) return

        const response = await fetch(
          `/api/notifications?onesignal_id=${encodeURIComponent(playerId)}`
        )

        if (response.ok) {
          const data = await response.json()
          setUnreadCount(data.unreadCount || 0)
        }
      } catch (error) {
        console.error('Failed to fetch unread count:', error)
      }
    }

    fetchUnreadCount()
    // 30秒ごとに更新
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [isPwa, isSubscribed])

  const handleSubscribe = async () => {
    setIsLoading(true)
    setMessage('')

    try {
      // OneSignalが利用可能か確認
      await waitForOneSignal()
      
      if (!window.OneSignal) {
        setMessage('通知サービスを準備中です。しばらく待ってから再度お試しください。')
        setIsLoading(false)
        return
      }

      // 通知許可を求める
      try {
        await window.OneSignal.Slidedown.promptPush()
      } catch (error: any) {
        // ドメイン設定エラーの場合は、ユーザーに分かりやすいメッセージを表示
        if (error?.message?.includes('Can only be used on')) {
          setMessage('通知機能は現在準備中です。しばらくお待ちください。')
          setIsLoading(false)
          return
        }
        throw error
      }

      // 少し待ってから許可状態を確認
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // 許可が得られたか確認
      let permission = false
      try {
        permission = await window.OneSignal.Notifications.permissionNative
      } catch (error) {
        // エラーは無視
      }
      
      if (!permission) {
        setMessage('通知が許可されませんでした。設定から通知を許可してください。')
        setIsLoading(false)
        return
      }

      // Player IDを取得（複数回試行）
      let playerId = null
      for (let i = 0; i < 3; i++) {
        try {
          playerId = await window.OneSignal.User.PushSubscription.id
          if (playerId) break
        } catch (error) {
          // エラーは無視して再試行
        }
        if (i < 2) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }

      if (!playerId) {
        setMessage('通知機能は現在準備中です。しばらくお待ちください。')
        setIsLoading(false)
        return
      }

      // Supabaseに保存
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .upsert(
          { onesignal_id: playerId },
          { onConflict: 'onesignal_id' }
        )

      if (error) {
        console.error('Supabase error:', error)
        setMessage('登録に失敗しました。もう一度お試しください。')
        setIsLoading(false)
        return
      }

      setIsSubscribed(true)
      setMessage('登録しました！')
      
      // 通知許可後、指定のURLに遷移（アラート表示後に遷移）
      // セキュリティチェック: 許可されたドメインのみ遷移
      const redirectUrl = 'https://utage-system.com/p/zwvVkDBzc2wb'
      if (redirectUrl.startsWith('https://')) {
        // 成功メッセージを表示してから遷移（1秒待機）
        await new Promise((resolve) => setTimeout(resolve, 1000))
        window.location.href = redirectUrl
      }
    } catch (error: any) {
      // ドメイン設定エラーの場合は、ユーザーに分かりやすいメッセージを表示
      if (error?.message?.includes('Can only be used on')) {
        setMessage('通知機能は現在準備中です。しばらくお待ちください。')
      } else {
        console.error('Subscribe error:', error)
        setMessage('通知の登録中にエラーが発生しました。もう一度お試しください。')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 通知履歴へのリンク（PWAモードで登録済みの場合） */}
        {isPwa && isSubscribed && (
          <div className="absolute top-4 right-4">
            <button
              onClick={() => router.push('/notifications')}
              className="relative inline-flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg hover:border-[#00f0ff]/50 transition-all"
            >
              <Bell className="w-5 h-5 text-[#00f0ff]" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#00f0ff] text-black text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        )}

        {/* メインコンテンツ */}
        <Bell className="w-16 h-16 text-[#00f0ff] mx-auto mb-6" />
        <h1 className="text-2xl font-bold mb-4">通知を受け取る</h1>
        <p className="text-gray-400 mb-8 text-sm">
          ホーム画面に追加してアプリとして使用してください
        </p>

        {/* メッセージ表示 */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.includes('完了') || message.includes('登録')
                ? 'bg-green-900/50 border border-green-500/50 text-green-300'
                : 'bg-red-900/50 border border-red-500/50 text-red-300'
            }`}
          >
            {message}
          </div>
        )}

        {/* PWAモードの時のみ、通知ボタンを表示 */}
        {isPwa && !isSubscribed && (
          <button
            onClick={handleSubscribe}
            disabled={isLoading || !isInitialized}
            className="w-full px-6 py-3 bg-[#00f0ff] text-black font-bold rounded-lg hover:bg-[#00d9e6] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                処理中...
              </span>
            ) : (
              '通知を受け取る'
            )}
          </button>
        )}

        {/* PWAモードで既に登録済みの場合 */}
        {isPwa && isSubscribed && (
          <div className="inline-block px-6 py-3 bg-[#00f0ff]/10 border border-[#00f0ff]/30 rounded-lg">
            <p className="text-[#00f0ff] font-semibold flex items-center justify-center gap-2">
              <Check className="w-5 h-5" />
              通知の設定が完了しています
            </p>
          </div>
        )}

        {/* ブラウザモードの場合 */}
        {!isPwa && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm">
              通知機能はアプリ版限定です。
              <br />
              ブラウザのメニューから「ホーム画面に追加」してください。
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
