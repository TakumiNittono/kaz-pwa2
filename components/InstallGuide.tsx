'use client'

import { useState } from 'react'
import { Share2, Plus, Check, Menu, MoreVertical, Download } from 'lucide-react'

export default function InstallGuide() {
  const [activeTab, setActiveTab] = useState<'ios' | 'android'>('ios')

  const iosSteps = [
    {
      number: 1,
      icon: Share2,
      title: 'シェアボタンをタップ',
      description: 'ブラウザ下部の「シェアボタン（四角から矢印）」アイコンをタップ',
    },
    {
      number: 2,
      icon: Plus,
      title: '「ホーム画面に追加」を選択',
      description: 'メニューから「ホーム画面に追加」を選択',
    },
    {
      number: 3,
      icon: Check,
      title: '「追加」をタップ',
      description: '右上の「追加」ボタンをタップして完了',
    },
  ]

  const androidSteps = [
    {
      number: 1,
      icon: MoreVertical,
      title: 'メニューを開く',
      description: 'ブラウザ右上の「メニュー（3点リーダー）」アイコンをタップ',
    },
    {
      number: 2,
      icon: Download,
      title: '「アプリをインストール」を選択',
      description: 'メニューから「アプリをインストール」または「ホーム画面に追加」を選択',
    },
    {
      number: 3,
      icon: Check,
      title: '「インストール」をタップ',
      description: '「インストール」ボタンをタップして完了',
    },
  ]

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          ホーム画面に追加して
          <br className="md:hidden" />
          アプリとして使う
        </h2>
        <p className="text-[#00f0ff] text-lg">
          より快適な学習体験のために、アプリとしてインストールしてください
        </p>
      </div>

      {/* タブ切り替え */}
      <div className="flex gap-4 mb-8 justify-center">
        <button
          onClick={() => setActiveTab('ios')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
            activeTab === 'ios'
              ? 'bg-[#00f0ff] text-black shadow-lg shadow-[#00f0ff]/50'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          iOS (iPhone)
        </button>
        <button
          onClick={() => setActiveTab('android')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
            activeTab === 'android'
              ? 'bg-[#00f0ff] text-black shadow-lg shadow-[#00f0ff]/50'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Android
        </button>
      </div>

      {/* 手順表示 */}
      <div className="grid md:grid-cols-3 gap-6">
        {(activeTab === 'ios' ? iosSteps : androidSteps).map((step, index) => {
          const Icon = step.icon
          return (
            <div
              key={index}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-[#00f0ff]/50 transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[#0040ff] rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">{step.number}</span>
                </div>
                <div className="w-10 h-10 bg-[#00f0ff]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-[#00f0ff]" />
                </div>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

