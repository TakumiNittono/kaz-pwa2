import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const maxDuration = 30
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabaseの設定が完了していません' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 最近の登録者を取得
    const { data: users, error } = await supabase
      .from('profiles')
      .select('onesignal_id, created_at')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Failed to fetch recent users:', error)
      return NextResponse.json(
        { error: '登録者情報の取得に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        users: users || [],
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
    console.error('Get recent users error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '登録者情報の取得に失敗しました',
      },
      { status: 500 }
    )
  }
}

