import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Client as OneSignalClient } from 'onesignal-node'

// Vercel向け: サーバーサイドで実行（Node.jsランタイム）
export const runtime = 'nodejs'
export const maxDuration = 30 // Vercelのタイムアウト設定（秒）

export async function POST(request: NextRequest) {
  try {
    // リクエストボディの取得
    const body = await request.json()
    const { title, message } = body

    // バリデーション
    if (!title || !message) {
      return NextResponse.json(
        { error: 'タイトルと本文は必須です' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      )
    }

    // 入力値のサニタイゼーション（XSS対策）
    const sanitizedTitle = String(title).trim().substring(0, 100)
    const sanitizedMessage = String(message).trim().substring(0, 500)

    // OneSignalクライアントの初期化
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID
    const restApiKey = process.env.ONESIGNAL_REST_API_KEY

    if (!appId || !restApiKey) {
      console.error('OneSignal credentials are not configured')
      return NextResponse.json(
        { error: 'OneSignalの設定が完了していません' },
        { status: 500 }
      )
    }

    const client = new OneSignalClient(appId, restApiKey)

    // 全ユーザーに通知を送信
    const notification = {
      contents: {
        en: sanitizedMessage,
        ja: sanitizedMessage,
      },
      headings: {
        en: sanitizedTitle,
        ja: sanitizedTitle,
      },
      included_segments: ['Subscribed Users'], // すべての購読済みユーザーに送信
    }

    const response = await client.createNotification(notification)

    // Supabaseに通知履歴を保存
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase credentials are not configured')
      // 通知は送信されているので、履歴保存のエラーは警告として扱う
      return NextResponse.json({
        success: true,
        message: '通知は送信されましたが、履歴の保存に失敗しました',
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { error: dbError } = await supabase.from('notifications').insert({
      title: sanitizedTitle,
      message: sanitizedMessage,
      sent_at: new Date().toISOString(),
    })

    if (dbError) {
      console.error('Failed to save notification history:', dbError)
      // 通知は送信されているので、履歴保存のエラーは警告として扱う
      return NextResponse.json({
        success: true,
        message: '通知は送信されましたが、履歴の保存に失敗しました',
        warning: dbError.message,
      })
    }

    return NextResponse.json(
      {
        success: true,
        message: '通知の送信が完了しました',
        notificationId: response.body?.id,
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
    console.error('Send notification error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '通知の送信に失敗しました',
      },
      { status: 500 }
    )
  }
}

