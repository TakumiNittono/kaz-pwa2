'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

declare global {
  interface Window {
    OneSignalDeferred?: Array<(...args: any[]) => void>
    OneSignal?: any
  }
}

export default function Home() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const checkOneSignalStatus = async () => {
      try {
        // OneSignalが初期化されるまで待機
        await new Promise<void>((resolve) => {
          if (window.OneSignal) {
            resolve()
            return
          }
          window.OneSignalDeferred?.push(() => {
            resolve()
          })
        })

        // 少し待ってから状態を確認
        setTimeout(async () => {
          try {
            const OneSignal = window.OneSignal
            if (!OneSignal) {
              console.error('OneSignal is not available')
              return
            }

            const isOptedIn = await OneSignal.Notifications.permissionNative
            if (isOptedIn) {
              setIsSubscribed(true)
            }
            setIsInitialized(true)
          } catch (error) {
            console.error('Error checking OneSignal status:', error)
            setIsInitialized(true)
          }
        }, 1000)
      } catch (error) {
        console.error('OneSignal initialization error:', error)
        setIsInitialized(true)
      }
    }

    checkOneSignalStatus()
  }, [])

  const handleSubscribe = async () => {
    setIsLoading(true)
    setMessage('')

    try {
      // OneSignalが初期化されるまで待機
      await new Promise<void>((resolve) => {
        if (window.OneSignal) {
          resolve()
          return
        }
        window.OneSignalDeferred?.push(() => {
          resolve()
        })
      })

      const OneSignal = window.OneSignal
      if (!OneSignal) {
        setMessage('通知サービスが初期化されていません。')
        setIsLoading(false)
        return
      }

      // 通知許可を求める
      await OneSignal.Slidedown.promptPush()

      // 少し待ってから許可状態とPlayer IDを確認
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // 許可が得られたか確認
      const permission = await OneSignal.Notifications.permissionNative
      
      if (!permission) {
        setMessage('通知が許可されませんでした。')
        setIsLoading(false)
        return
      }

      // Player IDを取得（複数の方法を試す）
      let userId = null
      
      // 方法1: User.PushSubscription.id
      try {
        userId = await OneSignal.User.PushSubscription.id
      } catch (e) {
        console.log('Method 1 failed, trying alternative...')
      }

      // 方法2: User.id (Player IDの別の取得方法)
      if (!userId) {
        try {
          userId = await OneSignal.User.id
        } catch (e) {
          console.log('Method 2 failed, trying alternative...')
        }
      }

      // 方法3: より長く待ってから再試行
      if (!userId) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        try {
          userId = await OneSignal.User.PushSubscription.id
        } catch (e) {
          console.error('Failed to get Player ID:', e)
        }
      }

      if (!userId) {
        setMessage('Player IDの取得に失敗しました。少し待ってから再度お試しください。')
        setIsLoading(false)
        return
      }

      // Supabaseに保存
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .upsert(
          { onesignal_id: userId },
          { onConflict: 'onesignal_id' }
        )

      if (error) {
        console.error('Supabase error:', error)
        setMessage('登録に失敗しました。もう一度お試しください。')
        setIsLoading(false)
        return
      }

      setIsSubscribed(true)
      setMessage('通知の登録が完了しました！')
    } catch (error) {
      console.error('Subscribe error:', error)
      setMessage('通知の登録中にエラーが発生しました。')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            コーチング通知アプリ
          </h1>
          <p className="text-gray-600">
            {isSubscribed
              ? '通知の登録が完了しています'
              : '学習を継続するための通知を受け取りましょう'}
          </p>
        </div>

        {message && (
          <div
            className={`mb-4 p-3 rounded-lg ${
              message.includes('完了')
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {message}
          </div>
        )}

        {!isSubscribed && (
          <button
            onClick={handleSubscribe}
            disabled={isLoading || !isInitialized}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            {isLoading ? '処理中...' : '通知を受け取る'}
          </button>
        )}

        {isSubscribed && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-green-800 font-medium">
              ✓ 通知の設定が完了しました
            </p>
            <p className="text-sm text-green-600 mt-2">
              これから学習のサポート通知をお届けします。
            </p>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-500">
          <p>登録は無料で、いつでも停止できます。</p>
        </div>
      </div>
    </div>
  )
}

