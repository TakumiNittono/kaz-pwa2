import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Client as OneSignalClient } from 'onesignal-node'

// Vercel向け: サーバーサイドで実行（Node.jsランタイム）
export const runtime = 'nodejs'
export const maxDuration = 60 // Cron処理は長めに設定（秒）

export async function GET(request: NextRequest) {
  try {
    // Vercel Cronからのリクエストか確認（セキュリティ強化）
    // Vercel Cronは自動的に 'x-vercel-cron' ヘッダーを追加します
    const cronHeader = request.headers.get('x-vercel-cron')
    const authHeader = request.headers.get('authorization')
    
    // 本番環境では、セキュリティチェックを実施
    if (process.env.NODE_ENV === 'production') {
      // Vercel Cronからのリクエストか確認
      if (!cronHeader) {
        // 手動実行の場合は認証ヘッダーをチェック
        const cronSecret = process.env.CRON_SECRET
        if (cronSecret) {
          if (authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
              { error: 'Unauthorized' },
              { status: 401 }
            )
          }
        } else {
          // CRON_SECRETが設定されていない場合、Vercel Cronからのリクエストのみ許可
          return NextResponse.json(
            { error: 'Unauthorized: Vercel Cron header required' },
            { status: 401 }
          )
        }
      }
    }

    // 環境変数の確認
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID
    const restApiKey = process.env.ONESIGNAL_REST_API_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!appId || !restApiKey || !supabaseUrl || !supabaseServiceKey) {
      console.error('Required environment variables are not configured')
      return NextResponse.json(
        { error: '環境変数が設定されていません' },
        { status: 500 }
      )
    }

    // 3日前の日付を計算
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    const threeDaysAgoDate = threeDaysAgo.toISOString().split('T')[0] // YYYY-MM-DD形式

    // 翌日の日付（範囲指定のため）
    const nextDay = new Date(threeDaysAgo)
    nextDay.setDate(nextDay.getDate() + 1)
    const nextDayDate = nextDay.toISOString().split('T')[0]

    // Supabaseから対象ユーザーを取得
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: profiles, error: queryError } = await supabase
      .from('profiles')
      .select('onesignal_id')
      .gte('created_at', `${threeDaysAgoDate}T00:00:00.000Z`)
      .lt('created_at', `${nextDayDate}T00:00:00.000Z`)

    if (queryError) {
      console.error('Failed to fetch profiles:', queryError)
      return NextResponse.json(
        { error: 'ユーザー情報の取得に失敗しました' },
        { status: 500 }
      )
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: '3日前に登録されたユーザーは見つかりませんでした',
          count: 0,
        },
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    // OneSignal Player IDのリストを取得
    const playerIds = profiles
      .map((profile) => profile.onesignal_id)
      .filter((id): id is string => Boolean(id))

    if (playerIds.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: '有効なPlayer IDが見つかりませんでした',
          count: 0,
        },
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    // OneSignalクライアントの初期化
    const client = new OneSignalClient(appId, restApiKey)

    // ステップ配信用メッセージ
    const title = '学習3日目おめでとうございます！'
    const message = '継続は力なり！3日間よく頑張りました。今日も一緒に学習を進めましょう。応援しています！'

    // 対象ユーザーに通知を送信
    const notification = {
      contents: {
        en: message,
        ja: message,
      },
      headings: {
        en: title,
        ja: title,
      },
      include_player_ids: playerIds, // 特定のPlayer IDリストに送信
    }

    const response = await client.createNotification(notification)

    return NextResponse.json(
      {
        success: true,
        message: 'ステップ配信が完了しました',
        count: playerIds.length,
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
    console.error('Step mail cron error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'ステップ配信に失敗しました',
      },
      { status: 500 }
    )
  }
}

