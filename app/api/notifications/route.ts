import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const maxDuration = 30
export const dynamic = 'force-dynamic'

// GET: 通知履歴を取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const onesignalId = searchParams.get('onesignal_id')

    if (!onesignalId) {
      return NextResponse.json(
        { error: 'onesignal_id is required' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabaseの設定が完了していません' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 通知履歴を取得（新しい順）
    const { data: notifications, error } = await supabase
      .from('user_notifications')
      .select('*')
      .eq('onesignal_id', onesignalId)
      .order('sent_at', { ascending: false })
      .limit(50) // 最新50件まで

    if (error) {
      console.error('Failed to fetch notifications:', error)
      return NextResponse.json(
        { error: '通知履歴の取得に失敗しました' },
        { status: 500 }
      )
    }

    // 未読通知の数をカウント
    const { count: unreadCount } = await supabase
      .from('user_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('onesignal_id', onesignalId)
      .is('read_at', null)

    return NextResponse.json(
      {
        success: true,
        notifications: notifications || [],
        unreadCount: unreadCount || 0,
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
    console.error('Get notifications error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '通知履歴の取得に失敗しました',
      },
      { status: 500 }
    )
  }
}

// PATCH: 通知を既読にする
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { onesignal_id, notification_id } = body

    if (!onesignal_id || !notification_id) {
      return NextResponse.json(
        { error: 'onesignal_id and notification_id are required' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabaseの設定が完了していません' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 通知を既読にする
    const { data, error } = await supabase
      .from('user_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notification_id)
      .eq('onesignal_id', onesignal_id) // セキュリティ: 自分の通知のみ更新可能
      .select()

    if (error) {
      console.error('Failed to mark notification as read:', error)
      return NextResponse.json(
        { error: '通知の既読処理に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        notification: data?.[0],
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Mark notification as read error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '通知の既読処理に失敗しました',
      },
      { status: 500 }
    )
  }
}

