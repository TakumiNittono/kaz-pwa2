'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Play, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Day1Lesson() {
  const [isCompleted, setIsCompleted] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const router = useRouter()

  // 紙吹雪エフェクト
  useEffect(() => {
    if (showConfetti) {
      const duration = 3000
      const timer = setTimeout(() => {
        setShowConfetti(false)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [showConfetti])

  const handleComplete = () => {
    setIsCompleted(true)
    setShowConfetti(true)
    
    // 3秒後にトップページに戻る
    setTimeout(() => {
      router.push('/')
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* 紙吹雪エフェクト */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                width: `${Math.random() * 10 + 5}px`,
                height: `${Math.random() * 10 + 5}px`,
                backgroundColor: ['#00f0ff', '#0040ff', '#ffffff', '#00ff88'][Math.floor(Math.random() * 4)],
                animation: `confetti-fall ${Math.random() * 2 + 2}s linear forwards`,
                animationDelay: `${Math.random() * 0.5}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
      )}

      {/* ヘッダー */}
      <header className="relative border-b border-gray-800 bg-black/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 hover:text-[#00f0ff] transition-colors"
          >
            ← 戻る
          </button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* タイトルセクション */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-[#00f0ff]/10 border border-[#00f0ff]/30 rounded-full mb-6">
            <span className="text-[#00f0ff] font-semibold">Day 1</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#0040ff]">
              学習の第一歩
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            今日から始める、あなたの学習ジャーニー
          </p>
        </div>

        {/* YouTube動画埋め込みセクション */}
        <div className="mb-12">
          <div className="relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
            <div className="aspect-video bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
              {/* YouTube動画のプレースホルダー */}
              <div className="text-center p-8">
                <div className="w-20 h-20 bg-[#00f0ff]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-10 h-10 text-[#00f0ff]" />
                </div>
                <p className="text-gray-400 mb-2">YouTube動画がここに表示されます</p>
                <p className="text-sm text-gray-500">
                  {/* 実際の動画IDを設定する場合は、以下のように埋め込みます */}
                  {/* <iframe
                    className="w-full h-full absolute inset-0"
                    src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  /> */}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 学習内容セクション */}
        <div className="mb-12">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-[#00f0ff]" />
              今日の学習ポイント
            </h2>
            <div className="space-y-4 text-gray-300">
              <p className="leading-relaxed">
                このレッスンでは、学習の基礎を学びます。動画を視聴して、重要なポイントを理解しましょう。
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>学習の習慣化の重要性</li>
                <li>継続的な成長のためのマインドセット</li>
                <li>目標設定の方法</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 完了ボタン */}
        <div className="text-center">
          {!isCompleted ? (
            <button
              onClick={handleComplete}
              className="group relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[#00f0ff] to-[#0040ff] text-black font-bold text-xl rounded-xl hover:shadow-lg hover:shadow-[#00f0ff]/50 transition-all duration-300 transform hover:scale-105"
            >
              <CheckCircle className="w-6 h-6" />
              <span>学習を完了する</span>
            </button>
          ) : (
            <div className="bg-gray-900 border border-[#00f0ff]/50 rounded-2xl p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-[#00f0ff] to-[#0040ff] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                おめでとうございます！
              </h3>
              <p className="text-gray-400 mb-4">
                学習を完了しました。トップページに戻ります...
              </p>
              <div className="flex justify-center">
                <div className="w-8 h-8 border-2 border-[#00f0ff] border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 紙吹雪スタイル */}
      <style jsx>{`
        .confetti {
          border-radius: 50%;
        }
      `}</style>
    </div>
  )
}

