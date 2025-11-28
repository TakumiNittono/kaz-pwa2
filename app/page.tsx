'use client'

import { useState, useEffect } from 'react'
import OneSignal from 'react-onesignal'
import { createClient } from '@/utils/supabase/client'

export default function Home() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const initializeOneSignal = () => {
      try {
        const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID
        if (!appId) {
          console.error('OneSignal App ID is not configured')
          return
        }

        OneSignal.initialize(appId, {
          allowLocalhostAsSecureOrigin: true,
        })

        setIsInitialized(true)

        // 既に通知が許可されているか確認
        OneSignal.isPushNotificationsEnabled().then((enabled) => {
          if (enabled) {
            setIsSubscribed(true)
          }
        })
      } catch (error) {
        console.error('OneSignal initialization error:', error)
        setMessage('通知サービスの初期化に失敗しました。')
      }
    }

    initializeOneSignal()
  }, [])

  const handleSubscribe = async () => {
    if (!isInitialized) {
      setMessage('通知サービスが初期化されていません。')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      // 通知許可を求める
      await OneSignal.showSlidedownPrompt()

      // 許可が得られたか確認
      const isEnabled = await OneSignal.isPushNotificationsEnabled()
      
      if (!isEnabled) {
        alert('通知が許可されませんでした。')
        setIsLoading(false)
        return
      }

      // Player IDを取得
      const playerId = await OneSignal.getPlayerId()

      if (!playerId) {
        alert('Player IDの取得に失敗しました。少し待ってから再度お試しください。')
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
        alert('登録に失敗しました。もう一度お試しください。')
        setIsLoading(false)
        return
      }

      setIsSubscribed(true)
      alert('登録しました！')
    } catch (error) {
      console.error('Subscribe error:', error)
      alert('通知の登録中にエラーが発生しました。')
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

