import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Client as OneSignalClient } from 'onesignal-node'

// Vercel向け: サーバーサイドで実行（Node.jsランタイム）
export const runtime = 'nodejs'
export const maxDuration = 60 // Cron処理は長めに設定（秒）
export const dynamic = 'force-dynamic' // 動的レンダリングを強制

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

    // ベースURLを取得（環境変数から、またはデフォルト値を使用）
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://kaz-pwa2.vercel.app')

    // ステップ配信の設定: 時間ウィンドウとメッセージの定義
    const stepConfigs = [
      {
        hours: 1,
        title: '通知設定完了！',
        message: '通知設定完了！早速ですが、最初のミッションです。',
        url: `${baseUrl}/lessons/day1`,
      },
      {
        hours: 24, // 1日
        title: '【Day 1】',
        message: '【Day 1】新しい習慣を始めましょう。',
        url: `${baseUrl}/lessons/day1`,
      },
      {
        hours: 48, // 2日
        title: '【Day 2】',
        message: '【Day 2】2日目も頑張っていますね！継続が力になります。',
        url: `${baseUrl}/lessons/day1`, // Day 2のページができたら変更
      },
      {
        hours: 72, // 3日
        title: '【Day 3】',
        message: '【Day 3】3日坊主をクリアしました！',
        url: `${baseUrl}/lessons/day1`, // Day 3のページができたら変更
      },
      {
        hours: 96, // 4日
        title: '【Day 4】',
        message: '【Day 4】4日目も順調です！習慣が定着してきていますね。',
        url: `${baseUrl}/lessons/day1`, // Day 4のページができたら変更
      },
      {
        hours: 120, // 5日
        title: '【Day 5】',
        message: '【Day 5】5日目、素晴らしい継続力です！',
        url: `${baseUrl}/lessons/day1`, // Day 5のページができたら変更
      },
      {
        hours: 144, // 6日
        title: '【Day 6】',
        message: '【Day 6】あと1日で1週間です！最後まで頑張りましょう。',
        url: `${baseUrl}/lessons/day1`, // Day 6のページができたら変更
      },
      {
        hours: 168, // 7日
        title: '【1週間突破】',
        message: '【1週間突破】あなたに特別なご褒美が届いています！',
        url: `${baseUrl}/lessons/day1`, // 1週間突破の特別ページができたら変更
      },
    ]

    // OneSignalクライアントの初期化
    const client = new OneSignalClient(appId, restApiKey)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const results: Array<{
      step: string
      count: number
      notificationId?: string
    }> = []

    const now = new Date()

    // 各ステップ配信を処理
    for (const config of stepConfigs) {
      try {
        // 現在時刻からN時間前の範囲を計算
        // 例: 1時間後の場合、現在から1時間〜2時間前に登録されたユーザーを検索
        // 例: 1日後の場合、現在から24時間〜25時間前に登録されたユーザーを検索
        const targetTimeStart = new Date(now.getTime() - (config.hours + 1) * 60 * 60 * 1000)
        const targetTimeEnd = new Date(now.getTime() - config.hours * 60 * 60 * 1000)

        // 1時間のウィンドウ内で登録されたユーザーを検索
        const { data: profiles, error: queryError } = await supabase
          .from('profiles')
          .select('onesignal_id')
          .gte('created_at', targetTimeStart.toISOString())
          .lt('created_at', targetTimeEnd.toISOString())

        if (queryError) {
          console.error(`Failed to fetch profiles for ${config.hours} hours:`, queryError)
          continue
        }

        if (!profiles || profiles.length === 0) {
          results.push({
            step: `${config.hours}時間後`,
            count: 0,
          })
          continue
        }

        // OneSignal Player IDのリストを取得
        const playerIds = profiles
          .map((profile) => profile.onesignal_id)
          .filter((id): id is string => Boolean(id))

        if (playerIds.length === 0) {
          results.push({
            step: `${config.hours}時間後`,
            count: 0,
          })
          continue
        }

        // 対象ユーザーに通知を送信
        const notification: any = {
          contents: {
            en: config.message,
            ja: config.message,
          },
          headings: {
            en: config.title,
            ja: config.title,
          },
          include_player_ids: playerIds,
        }

        // URLが設定されている場合は追加
        if (config.url) {
          notification.url = config.url
        }

        const response = await client.createNotification(notification)

        // 通知履歴をSupabaseに保存（各ユーザーごと）
        if (response.body?.id && playerIds.length > 0) {
          try {
            // ステップ配信の通知履歴を保存
            const notificationRecords = playerIds.map((playerId) => ({
              onesignal_id: playerId,
              title: config.title,
              message: config.message,
              url: config.url || null,
              step_hours: config.hours,
              sent_at: new Date().toISOString(),
            }))

            // バッチで一括挿入（パフォーマンス向上のため）
            const { error: dbError } = await supabase
              .from('user_notifications')
              .insert(notificationRecords)

            if (dbError) {
              console.error(`Failed to save notification history for ${config.hours} hours:`, dbError)
              // 通知は送信されているので、履歴保存のエラーは警告として扱う
            } else {
              console.log(
                `Step mail sent and saved: ${config.hours} hours, ${playerIds.length} users, notification ID: ${response.body?.id}`
              )
            }
          } catch (dbError) {
            console.error(`Failed to save notification history for ${config.hours} hours:`, dbError)
            // 通知は送信されているので、履歴保存のエラーは警告として扱う
          }
        }

        results.push({
          step: `${config.hours}時間後`,
          count: playerIds.length,
          notificationId: response.body?.id,
        })
      } catch (error) {
        console.error(`Error processing step ${config.hours} hours:`, error)
        results.push({
          step: `${config.hours}時間後`,
          count: 0,
        })
      }
    }

    // 結果を集計
    const totalCount = results.reduce((sum, result) => sum + result.count, 0)
    const successCount = results.filter((r) => r.count > 0).length

    return NextResponse.json(
      {
        success: true,
        message: `ステップ配信が完了しました（${successCount}/${stepConfigs.length}ステップ実行）`,
        totalCount,
        results,
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

