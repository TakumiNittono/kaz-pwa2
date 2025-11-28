'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function AdminDashboard() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [totalUsers, setTotalUsers] = useState<number | null>(null)

  useEffect(() => {
    const fetchTotalUsers = async () => {
      try {
        const supabase = createClient()
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })

        if (error) {
          console.error('Error fetching total users:', error)
          return
        }

        setTotalUsers(count)
      } catch (error) {
        console.error('Error fetching total users:', error)
      }
    }

    fetchTotalUsers()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus(null)

    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, message }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '通知の送信に失敗しました')
      }

      setStatus({
        type: 'success',
        message: '通知の送信が完了しました！',
      })
      setTitle('')
      setMessage('')
    } catch (error) {
      console.error('Send notification error:', error)
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : '通知の送信中にエラーが発生しました。',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">管理者ダッシュボード</h1>
              <p className="text-gray-600 mt-1">全ユーザーへの一斉通知を送信</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors duration-200"
            >
              ログアウト
            </button>
          </div>
        </div>

        {/* Notification Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">通知を送信</h2>

          {status && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                status.type === 'success'
                  ? 'bg-green-100 border border-green-400 text-green-700'
                  : 'bg-red-100 border border-red-400 text-red-700'
              }`}
            >
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                タイトル <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="例: 学習お疲れさまです！"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                本文 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                placeholder="例: 今日も1日お疲れさまです。継続は力なり、一緒に頑張りましょう！"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              {isLoading ? '送信中...' : '通知を送信する'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>注意:</strong> この通知は、通知を許可した全ユーザーに配信されます。
            </p>
          </div>
        </div>

        {/* 登録者総数表示 */}
        <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">登録者情報</h2>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-blue-600">
              {totalUsers !== null ? totalUsers.toLocaleString() : '---'}
            </div>
            <div className="text-gray-600">
              <p className="text-lg font-medium">登録者総数</p>
              <p className="text-sm">通知を許可したユーザー数</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

