import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

// POST: 既存のnotificationsテーブルのデータをuser_notificationsテーブルに移行
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 認証チェック
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

    // サービスロールキーを使用して、RLSをバイパスしてデータを移行
    const serviceClient = createServiceClient(supabaseUrl, supabaseServiceKey)

    // 1. 既存のnotificationsテーブルから全通知を取得
    const { data: notifications, error: notificationsError } = await serviceClient
      .from('notifications')
      .select('*')
      .order('sent_at', { ascending: true })

    if (notificationsError) {
      throw notificationsError
    }

    if (!notifications || notifications.length === 0) {
      return NextResponse.json({
        success: true,
        message: '移行する通知がありません。notificationsテーブルにデータが存在しません。',
        notificationsCount: 0,
        usersCount: 0,
        totalRecords: 0,
        insertedCount: 0,
      })
    }

    // 2. 現在登録されている全ユーザーを取得
    const { data: profiles, error: profilesError } = await serviceClient
      .from('profiles')
      .select('onesignal_id')

    if (profilesError) {
      throw profilesError
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        success: true,
        message: '移行するユーザーがありません。profilesテーブルに登録されているユーザーがいません。',
        notificationsCount: notifications.length,
        usersCount: 0,
        totalRecords: 0,
        insertedCount: 0,
      })
    }

    // 3. 既存のuser_notificationsを確認（重複を避けるため）
    const { data: existingNotifications, error: existingError } = await serviceClient
      .from('user_notifications')
      .select('onesignal_id, title, message, sent_at')

    if (existingError) {
      console.error('Failed to fetch existing notifications:', existingError)
      // 続行（重複チェックをスキップ）
    }

    // 4. 各通知を全ユーザーのuser_notificationsに追加
    let migratedCount = 0
    const notificationRecords: any[] = []

    for (const notification of notifications) {
      for (const profile of profiles) {
        // 重複チェック
        const isDuplicate = existingNotifications?.some(
          (existing) =>
            existing.onesignal_id === profile.onesignal_id &&
            existing.title === notification.title &&
            existing.message === notification.message &&
            new Date(existing.sent_at).getTime() === new Date(notification.sent_at).getTime()
        )

        if (!isDuplicate) {
          notificationRecords.push({
            onesignal_id: profile.onesignal_id,
            title: notification.title,
            message: notification.message,
            url: null,
            step_hours: null,
            sent_at: notification.sent_at,
            created_at: notification.sent_at,
          })
          migratedCount++
        }
      }
    }

    // 5. バッチで一括挿入（1000件ずつ）
    const batchSize = 1000
    let insertedCount = 0

    for (let i = 0; i < notificationRecords.length; i += batchSize) {
      const batch = notificationRecords.slice(i, i + batchSize)
      const { error: insertError } = await serviceClient
        .from('user_notifications')
        .insert(batch)

      if (insertError) {
        console.error(`Failed to insert batch ${i / batchSize + 1}:`, insertError)
        // エラーがあっても続行
      } else {
        insertedCount += batch.length
      }
    }

    // メッセージを生成
    let message = '通知の移行が完了しました'
    if (insertedCount === 0 && notificationRecords.length === 0) {
      message = '全ての通知は既に移行済みです（重複のため新規追加なし）'
    } else if (insertedCount === 0 && notificationRecords.length > 0) {
      message = `移行処理を実行しましたが、データの挿入に失敗しました。詳細はサーバーログを確認してください。`
    } else if (insertedCount < notificationRecords.length) {
      message = `一部の通知履歴の追加に失敗しました。${insertedCount}件/${notificationRecords.length}件が追加されました。`
    }

    return NextResponse.json(
      {
        success: true,
        message: message,
        notificationsCount: notifications.length,
        usersCount: profiles.length,
        totalRecords: notificationRecords.length,
        insertedCount: insertedCount,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error migrating notifications:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '通知の移行に失敗しました',
      },
      { status: 500 }
    )
  }
}

