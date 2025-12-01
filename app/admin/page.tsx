'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Users, Bell, TrendingUp, Calendar, Play, RefreshCw } from 'lucide-react'

interface Stats {
  today: number
  week: number
  month: number
  total: number
  dailyRegistrations: Record<string, number>
  dailyNotifications: Record<string, number>
}

interface RecentUser {
  onesignal_id: string
  created_at: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [totalUsers, setTotalUsers] = useState<number | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [isRunningStepMail, setIsRunningStepMail] = useState(false)
  const [stepMailResult, setStepMailResult] = useState<any>(null)
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrateResult, setMigrateResult] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 統計情報を取得
        const statsResponse = await fetch('/api/admin/stats')
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData.stats)
          setTotalUsers(statsData.stats.total)
        }

        // 最近の登録者を取得
        const usersResponse = await fetch('/api/admin/recent-users?limit=10')
        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          setRecentUsers(usersData.users || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoadingStats(false)
      }
    }

    fetchData()
    // 30秒ごとに更新
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
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
      // 統計情報を再取得
      const statsResponse = await fetch('/api/admin/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.stats)
        setTotalUsers(statsData.stats.total)
      }
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

  const handleRunStepMail = async () => {
    setIsRunningStepMail(true)
    setStepMailResult(null)

    try {
      const response = await fetch('/api/admin/run-step-mail', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'ステップ配信の実行に失敗しました')
      }

      setStepMailResult(data)
      setStatus({
        type: 'success',
        message: 'ステップ配信が完了しました！',
      })
    } catch (error) {
      console.error('Run step mail error:', error)
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'ステップ配信の実行にエラーが発生しました。',
      })
    } finally {
      setIsRunningStepMail(false)
    }
  }

  const handleMigrateNotifications = async () => {
    if (!confirm('過去の通知履歴を全ユーザーの通知履歴に移行しますか？\nこの処理には時間がかかる場合があります。')) {
      return
    }

    setIsMigrating(true)
    setMigrateResult(null)

    try {
      const response = await fetch('/api/admin/migrate-notifications', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '通知の移行に失敗しました')
      }

      setMigrateResult(data)
      setStatus({
        type: 'success',
        message: `通知の移行が完了しました！${data.insertedCount || 0}件の通知履歴を追加しました。`,
      })
    } catch (error) {
      console.error('Migrate notifications error:', error)
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : '通知の移行にエラーが発生しました。',
      })
    } finally {
      setIsMigrating(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
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

        {/* 統計情報ダッシュボード */}
        <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">統計情報</h2>
            <button
              onClick={() => {
                setIsLoadingStats(true)
                fetch('/api/admin/stats')
                  .then((res) => res.json())
                  .then((data) => {
                    setStats(data.stats)
                    setTotalUsers(data.stats.total)
                  })
                  .finally(() => setIsLoadingStats(false))
              }}
              className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${isLoadingStats ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {isLoadingStats ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600">今日</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{stats.today}</div>
                <div className="text-xs text-gray-500">登録者</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">今週</span>
                </div>
                <div className="text-2xl font-bold text-green-600">{stats.week}</div>
                <div className="text-xs text-gray-500">登録者</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-600">今月</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">{stats.month}</div>
                <div className="text-xs text-gray-500">登録者</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-600">総数</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                <div className="text-xs text-gray-500">登録者</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">データを読み込み中...</div>
          )}

          {/* 日別登録者数の簡易表示 */}
          {stats && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">過去30日の登録者数</h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                <div className="space-y-2">
                  {Object.entries(stats.dailyRegistrations)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .slice(0, 10)
                    .map(([date, count]) => (
                      <div key={date} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{date}</span>
                        <span className="font-semibold text-gray-800">{count}人</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 通知履歴の移行 */}
        <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">通知履歴の移行</h2>
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 font-semibold mb-1">
              ⚠️ 過去の通知履歴を移行
            </p>
            <p className="text-xs text-yellow-700">
              `notifications`テーブルに保存されている過去の通知を、全ユーザーの`user_notifications`テーブルに移行します。
              これにより、アプリの通知履歴ページに過去の通知が表示されるようになります。
            </p>
          </div>
          <button
            onClick={handleMigrateNotifications}
            disabled={isMigrating}
            className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {isMigrating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                移行中...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                過去の通知履歴を移行
              </>
            )}
          </button>

          {migrateResult && (
            <div className={`mt-4 p-4 border rounded-lg ${
              migrateResult.insertedCount > 0 
                ? 'bg-green-50 border-green-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <h3 className={`font-semibold mb-2 ${
                migrateResult.insertedCount > 0 
                  ? 'text-green-800' 
                  : 'text-yellow-800'
              }`}>
                移行結果
              </h3>
              {migrateResult.message && (
                <p className={`text-sm mb-2 ${
                  migrateResult.insertedCount > 0 
                    ? 'text-green-700' 
                    : 'text-yellow-700'
                }`}>
                  {migrateResult.message}
                </p>
              )}
              <div className={`text-sm space-y-1 ${
                migrateResult.insertedCount > 0 
                  ? 'text-green-700' 
                  : 'text-yellow-700'
              }`}>
                <p>通知数: {migrateResult.notificationsCount || 0}件</p>
                <p>ユーザー数: {migrateResult.usersCount || 0}人</p>
                <p>追加された通知履歴: {migrateResult.insertedCount || 0}件</p>
                {migrateResult.totalRecords !== undefined && migrateResult.totalRecords > 0 && (
                  <p>重複を除いた件数: {migrateResult.totalRecords}件</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ステップ配信の手動実行 */}
        <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">ステップ配信</h2>
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-semibold mb-1">
              ✓ 自動実行が有効です
            </p>
            <p className="text-xs text-green-700">
              毎日UTC 22:00（日本時間 07:00）に自動的に実行されます。8つの時間ウィンドウ（1時間後、1日後、2日後...7日後）のユーザーに通知を送信します。
            </p>
          </div>
          <p className="text-gray-600 mb-4 text-sm">
            テストや緊急時には、下のボタンで手動実行も可能です。
          </p>
          <button
            onClick={handleRunStepMail}
            disabled={isRunningStepMail}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {isRunningStepMail ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                実行中...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                ステップ配信を実行
              </>
            )}
          </button>

          {stepMailResult && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">実行結果</h3>
              <div className="text-sm text-green-700 space-y-1">
                <p>メッセージ: {stepMailResult.message}</p>
                <p>総送信数: {stepMailResult.totalCount || 0}件</p>
                {stepMailResult.results && (
                  <div className="mt-2">
                    <p className="font-semibold mb-1">各ステップの結果:</p>
                    <div className="space-y-1">
                      {stepMailResult.results.map((result: any, index: number) => (
                        <p key={index} className="text-xs">
                          {result.step}: {result.count}件
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 最近の登録者リスト */}
        <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">最近の登録者</h2>
          {recentUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">登録者はいません</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Player ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">登録日時</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600 font-mono">
                        {user.onesignal_id.substring(0, 20)}...
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(user.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 登録者総数表示（既存） */}
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

