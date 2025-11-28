import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const maxDuration = 30
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabaseの設定が完了していません' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    // 今日の登録者数
    const { count: todayCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString())

    // 今週の登録者数
    const { count: weekCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo.toISOString())

    // 今月の登録者数
    const { count: monthCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', monthAgo.toISOString())

    // 総登録者数
    const { count: totalCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // 日別の登録者数（過去30日）
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    const { data: dailyData } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true })

    // 日別に集計
    const dailyStats: Record<string, number> = {}
    if (dailyData) {
      dailyData.forEach((profile) => {
        const date = new Date(profile.created_at).toISOString().split('T')[0]
        dailyStats[date] = (dailyStats[date] || 0) + 1
      })
    }

    // 通知送信数の推移（過去30日）
    const { data: notifications } = await supabase
      .from('notifications')
      .select('sent_at')
      .gte('sent_at', thirtyDaysAgo.toISOString())
      .order('sent_at', { ascending: true })

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

