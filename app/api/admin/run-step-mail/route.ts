import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // ステップ配信APIを呼び出し
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://kaz-pwa2.vercel.app')

    const response = await fetch(`${baseUrl}/api/cron/step-mail`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'manual-execution'}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'ステップ配信の実行に失敗しました' },
        { status: response.status }
      )
    }

    return NextResponse.json(
      {
        success: true,
        ...data,
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Run step mail error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'ステップ配信の実行に失敗しました',
      },
      { status: 500 }
    )
  }
}

