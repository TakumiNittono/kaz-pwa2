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
      console.error('App ID:', appId ? 'Set' : 'Missing')
      console.error('REST API Key:', restApiKey ? 'Set' : 'Missing')
      return NextResponse.json(
        { error: 'OneSignalの設定が完了していません。環境変数を確認してください。' },
        { status: 500 }
      )
    }

    // REST API Keyの形式を確認（通常は長い文字列）
    if (restApiKey.length < 20) {
      console.error('REST API Key appears to be invalid (too short)')
      return NextResponse.json(
        { error: 'OneSignal REST API Keyが無効です。正しいキーを設定してください。' },
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
      included_segments: ['All'], // すべてのユーザーに送信
    }

    let response
    try {
      response = await client.createNotification(notification)
    } catch (onesignalError: any) {
      console.error('OneSignal API error:', onesignalError)
      console.error('Error details:', JSON.stringify(onesignalError, null, 2))
      
      // OneSignal APIエラーの詳細を返す
      const errorMessage = onesignalError?.body?.errors?.[0] || 
                          onesignalError?.message || 
                          'OneSignal APIへのリクエストに失敗しました'
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: 'OneSignal REST API Keyが正しく設定されているか確認してください。Vercelの環境変数を確認してください。'
        },
        { status: 500 }
      )
    }

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

    // 管理者用の通知履歴テーブルに保存（既存の機能を維持）
    const { error: adminDbError } = await supabase.from('notifications').insert({
      title: sanitizedTitle,
      message: sanitizedMessage,
      sent_at: new Date().toISOString(),
    })

    if (adminDbError) {
      console.error('Failed to save admin notification history:', adminDbError)
    }

    // 全ユーザーのuser_notificationsテーブルに保存（ユーザー個別の通知履歴）
    try {
      // 全ユーザーのonesignal_idを取得
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('onesignal_id')

      if (profilesError) {
        console.error('Failed to fetch profiles:', profilesError)
      } else if (profiles && profiles.length > 0) {
        // 各ユーザーに通知履歴を保存
        const notificationRecords = profiles.map((profile) => ({
          onesignal_id: profile.onesignal_id,
          title: sanitizedTitle,
          message: sanitizedMessage,
          url: null, // 管理者送信の通知にはURLは設定しない
          step_hours: null, // ステップ配信ではない
          sent_at: new Date().toISOString(),
        }))

        // バッチで一括挿入（パフォーマンス向上のため）
        const { error: userDbError } = await supabase
          .from('user_notifications')
          .insert(notificationRecords)

        if (userDbError) {
          console.error('Failed to save user notification history:', userDbError)
          // 通知は送信されているので、履歴保存のエラーは警告として扱う
          return NextResponse.json({
            success: true,
            message: '通知は送信されましたが、履歴の保存に失敗しました',
            warning: userDbError.message,
          })
        }

        console.log(`Notification saved to ${profiles.length} users' notification history`)
      }
    } catch (userHistoryError) {
      console.error('Failed to save user notification history:', userHistoryError)
      // 通知は送信されているので、履歴保存のエラーは警告として扱う
      return NextResponse.json({
        success: true,
        message: '通知は送信されましたが、履歴の保存に失敗しました',
        warning: userHistoryError instanceof Error ? userHistoryError.message : 'Unknown error',
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

