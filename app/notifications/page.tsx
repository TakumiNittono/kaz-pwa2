'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Bell, ArrowLeft, CheckCircle, Circle, ExternalLink } from 'lucide-react'

declare global {
  interface Window {
    OneSignalDeferred?: Array<(...args: any[]) => void>
    OneSignal?: any
  }
}

interface Notification {
  id: string
  title: string
  message: string
  url: string | null
  step_hours: number | null
  sent_at: string
  read_at: string | null
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [playerId, setPlayerId] = useState<string | null>(null)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // OneSignal Player IDを取得
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

        await new Promise((resolve) => setTimeout(resolve, 1000))

        let currentPlayerId: string | null = null
        if (window.OneSignal) {
          try {
            currentPlayerId = await window.OneSignal.User.PushSubscription.id
          } catch (error) {
            console.error('Failed to get player ID:', error)
          }
        }

        if (!currentPlayerId) {
          setIsLoading(false)
          return
        }

        setPlayerId(currentPlayerId)

        // 通知履歴を取得
        const response = await fetch(
          `/api/notifications?onesignal_id=${encodeURIComponent(currentPlayerId)}`
        )

        if (!response.ok) {
          throw new Error('通知履歴の取得に失敗しました')
        }

        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const handleMarkAsRead = async (notificationId: string) => {
    if (!playerId) return

    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          onesignal_id: playerId,
          notification_id: notificationId,
        }),
      })

      if (!response.ok) {
        throw new Error('既読処理に失敗しました')
      }

      // ローカル状態を更新
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId
            ? { ...notif, read_at: new Date().toISOString() }
            : notif
        )
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    // 未読の場合は既読にする
    if (!notification.read_at) {
      await handleMarkAsRead(notification.id)
    }

    // URLがある場合は遷移
    if (notification.url) {
      if (notification.url.startsWith('http')) {
        window.open(notification.url, '_blank')
      } else {
        router.push(notification.url)
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))

    if (days > 0) {
      return `${days}日前`
    } else if (hours > 0) {
      return `${hours}時間前`
    } else if (minutes > 0) {
      return `${minutes}分前`
    } else {
      return 'たった今'
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-black border-b border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 hover:text-[#00f0ff] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">通知履歴</h1>
            {unreadCount > 0 && (
              <p className="text-xs text-[#00f0ff] mt-1">
                未読: {unreadCount}件
              </p>
            )}
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-6 h-6 border-2 border-[#00f0ff] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-400 mt-4 text-sm">読み込み中...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">通知はありません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`bg-gray-900 border rounded-lg p-4 cursor-pointer transition-all hover:border-[#00f0ff]/50 ${
                  notification.read_at
                    ? 'border-gray-800 opacity-70'
                    : 'border-[#00f0ff]/30 bg-[#00f0ff]/5'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {notification.read_at ? (
                      <CheckCircle className="w-4 h-4 text-gray-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-[#00f0ff]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-white text-sm">
                        {notification.title}
                      </h3>
                      {notification.url && (
                        <ExternalLink className="w-3 h-3 text-[#00f0ff] flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{notification.message}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{formatDate(notification.sent_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

