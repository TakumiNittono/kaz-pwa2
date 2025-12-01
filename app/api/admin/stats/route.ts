import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const maxDuration = 30
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabaseの設定が完了していません' },
        { status: 500 }
      )
    }

    // 統計取得にはService Role Keyを使用（RLSをバイパス）
    const supabaseAdmin = createServiceClient(supabaseUrl, supabaseServiceKey)

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    // 今週の始まり（月曜日を週の始まりとする）
    const weekStart = new Date(today)
    const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay() // 日曜日を7に変換
    weekStart.setDate(today.getDate() - (dayOfWeek - 1))
    weekStart.setHours(0, 0, 0, 0)
    
    // 今月の1日
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    monthStart.setHours(0, 0, 0, 0)

    // 今日の登録者数
    const { count: todayCount, error: todayError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString())

    if (todayError) {
      console.error('Error fetching today count:', todayError)
    }

    // 今週の登録者数
    const { count: weekCount, error: weekError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekStart.toISOString())

    if (weekError) {
      console.error('Error fetching week count:', weekError)
    }

    // 今月の登録者数
    const { count: monthCount, error: monthError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', monthStart.toISOString())

    if (monthError) {
      console.error('Error fetching month count:', monthError)
    }

    // 総登録者数
    const { count: totalCount, error: totalError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (totalError) {
      console.error('Error fetching total count:', totalError)
    }

    // 日別の登録者数（過去30日）
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    const { data: dailyData, error: dailyError } = await supabaseAdmin
      .from('profiles')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true })

    if (dailyError) {
      console.error('Error fetching daily data:', dailyError)
    }

    // 日別に集計
    const dailyStats: Record<string, number> = {}
    if (dailyData) {
      dailyData.forEach((profile) => {
        const date = new Date(profile.created_at).toISOString().split('T')[0]
        dailyStats[date] = (dailyStats[date] || 0) + 1
      })
    }

    // 通知送信数の推移（過去30日）
    const { data: notifications, error: notificationsError } = await supabaseAdmin
      .from('notifications')
      .select('sent_at')
      .gte('sent_at', thirtyDaysAgo.toISOString())
      .order('sent_at', { ascending: true })

    if (notificationsError) {
      console.error('Error fetching notifications:', notificationsError)
    }

    // 日別に集計
    const notificationStats: Record<string, number> = {}
    if (notifications) {
      notifications.forEach((notification) => {
        const date = new Date(notification.sent_at).toISOString().split('T')[0]
        notificationStats[date] = (notificationStats[date] || 0) + 1
      })
    }

    return NextResponse.json(
      {
        success: true,
        stats: {
          today: todayCount || 0,
          week: weekCount || 0,
          month: monthCount || 0,
          total: totalCount || 0,
          dailyRegistrations: dailyStats,
          dailyNotifications: notificationStats,
        },
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '統計情報の取得に失敗しました',
      },
      { status: 500 }
    )
  }
}

