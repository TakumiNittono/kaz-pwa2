'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import InstallGuide from '@/components/InstallGuide'
import { Bell, Zap, Shield, Sparkles, ArrowRight } from 'lucide-react'

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
        // OneSignal SDKが読み込まれるまで待機（layout.tsxで初期化される）
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
  }, [])

  const handleSubscribe = async () => {
    setIsLoading(true)
    setMessage('')

    try {
      // OneSignalが利用可能か確認
      if (!window.OneSignal) {
        alert('通知サービスを準備中です。しばらく待ってから再度お試しください。')
        setIsLoading(false)
        return
      }

      // 通知許可を求める（エラーは無視）
      try {
        await window.OneSignal.Slidedown.promptPush()
      } catch (error: any) {
        // ドメイン設定エラーの場合は、ユーザーに分かりやすいメッセージを表示
        if (error?.message?.includes('Can only be used on')) {
          alert('通知機能は現在準備中です。しばらくお待ちください。')
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
        alert('通知が許可されませんでした。')
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
        alert('通知機能は現在準備中です。しばらくお待ちください。')
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
    } catch (error: any) {
      // ドメイン設定エラーの場合は、ユーザーに分かりやすいメッセージを表示
      if (error?.message?.includes('Can only be used on')) {
        alert('通知機能は現在準備中です。しばらくお待ちください。')
      } else {
        console.log('Subscribe error:', error)
        alert('通知の登録中にエラーが発生しました。')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    {
      icon: Shield,
      title: 'メアド登録不要',
      description: 'アカウント作成もメールアドレスも不要。ボタンひとつで即スタート。',
      color: 'from-[#00f0ff] to-[#0040ff]',
    },
    {
      icon: Zap,
      title: '習慣化の自動化',
      description: 'AIコーチがあなたの学習ペースを最適化。3日目、7日目と自動で応援メッセージが届きます。',
      color: 'from-[#0040ff] to-[#00f0ff]',
    },
    {
      icon: Sparkles,
      title: '完全パーソナライズ',
      description: 'あなたの学習データから最適なタイミングで、最適なメッセージを配信します。',
      color: 'from-[#00f0ff] to-[#0040ff]',
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* ヒーローセクション */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20 md:py-32">
        {/* 背景グラデーション */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00f0ff]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#0040ff]/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00f0ff]/5 rounded-full blur-3xl" />
        </div>

        {/* 幾何学模様 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-2 h-2 bg-[#00f0ff] rounded-full" />
          <div className="absolute top-40 right-20 w-1 h-1 bg-[#00f0ff] rounded-full" />
          <div className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-[#0040ff] rounded-full" />
          <div className="absolute bottom-20 right-10 w-2 h-2 bg-[#0040ff] rounded-full" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="mb-8 inline-block">
            <Bell className="w-16 h-16 md:w-20 md:h-20 text-[#00f0ff] mx-auto animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
            その学習、
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#0040ff]">
              通知ひとつで変わる。
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            アプリを開く必要すらありません。
            <br />
            AIコーチがあなたのポケットに入り込みます。
          </p>
        </div>
      </section>

      {/* インストールガイドセクション */}
      <section className="relative py-20 md:py-32 px-4 bg-gradient-to-b from-black via-gray-950 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,240,255,0.05),transparent_50%)]" />
        <div className="relative z-10">
          <InstallGuide />
        </div>
      </section>

      {/* 機能紹介セクション */}
      <section className="relative py-20 md:py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              なぜ選ばれるのか
            </h2>
            <p className="text-gray-400 text-lg">
              無駄を削ぎ落とした、最速の学習体験
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="group relative bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-[#00f0ff]/50 transition-all duration-300 hover:transform hover:scale-105"
                >
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* エントリーセクション */}
      <section className="relative py-20 md:py-32 px-4 bg-gradient-to-b from-black via-gray-950 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,64,255,0.1),transparent_50%)]" />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
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

          {isSubscribed ? (
            <div className="bg-gray-900 border border-[#00f0ff]/50 rounded-2xl p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-[#00f0ff] to-[#0040ff] rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                登録完了
              </h3>
              <p className="text-gray-400">
                これから学習のサポート通知をお届けします。
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                準備ができたら、
                <br />
                通知を受け取ってスタート
              </h2>
              <p className="text-gray-400 mb-8 text-lg">
                登録は無料で、いつでも停止できます
              </p>
              <button
                onClick={handleSubscribe}
                disabled={isLoading || !isInitialized}
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#00f0ff] to-[#0040ff] text-black font-bold text-lg rounded-xl hover:shadow-lg hover:shadow-[#00f0ff]/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>処理中...</span>
                  </>
                ) : (
                  <>
                    <span>通知を受け取る</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </section>

      {/* フッター */}
      <footer className="border-t border-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center text-gray-500 text-sm">
          <p>© 2024 次世代コーチングアプリ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
