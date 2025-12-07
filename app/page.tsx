'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Bell, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

declare global {
  interface Window {
    OneSignalDeferred?: Array<(...args: any[]) => void>
    OneSignal?: any
  }
}

export default function Home() {
  const router = useRouter()
  const [isInitialized, setIsInitialized] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isPwa, setIsPwa] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [hasShownPushPrimer, setHasShownPushPrimer] = useState(false)

  // Check PWA mode
  useEffect(() => {
    const checkPwaMode = () => {
      // Check display-mode: standalone
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      
      // Check iOS standalone mode
      const isIOSStandalone = (navigator as any).standalone === true
      
      // Determine if opened as PWA
      const pwaMode = isStandalone || isIOSStandalone
      setIsPwa(pwaMode)
    }

    // Initial check
    checkPwaMode()

    // Monitor media query changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    const handleChange = () => checkPwaMode()
    
    // Listen to media query changes (if supported)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange)
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange)
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleChange)
      }
    }
  }, [])

  // Wait for OneSignal SDK to load
  const waitForOneSignal = async (): Promise<void> => {
    await new Promise<void>((resolve) => {
      if (window.OneSignal) {
        resolve()
        return
      }
      window.OneSignalDeferred = window.OneSignalDeferred || []
      window.OneSignalDeferred.push(() => {
        resolve()
      })
    })
  }

  useEffect(() => {
    // Check OneSignal status only in PWA mode
    if (!isPwa) return

    const checkOneSignalStatus = async () => {
      try {
        // Wait for OneSignal SDK to load (initialized in layout.tsx)
        await waitForOneSignal()

        // Wait a bit before checking status (wait for initialization to complete)
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Check if notifications are already permitted
        try {
          if (window.OneSignal) {
            const permission = await window.OneSignal.Notifications.permissionNative
            if (permission) {
              // Already subscribed - just update state but don't show message
              setIsSubscribed(true)
              setIsInitialized(true)
              
              // Get Player ID and save to Supabase silently
              let playerId = null
              for (let i = 0; i < 3; i++) {
                try {
                  playerId = await window.OneSignal.User.PushSubscription.id
                  if (playerId) break
                } catch (error) {
                  // Ignore errors and retry
                }
                if (i < 2) {
                  await new Promise((resolve) => setTimeout(resolve, 1000))
                }
              }

              if (playerId) {
                const supabase = createClient()
                await supabase
                  .from('profiles')
                  .upsert(
                    { onesignal_id: playerId },
                    { onConflict: 'onesignal_id' }
                  )
              }
              return
            }
            setIsInitialized(true)
            
            // Automatically prompt for notification permission if not subscribed
            // Wait for Push Primer to appear and user to interact
            if (!permission && !hasShownPushPrimer) {
              try {
                // Mark that we've shown the Push Primer
                setHasShownPushPrimer(true)
                
                // Show the Push Primer (notification permission prompt)
                await window.OneSignal.Slidedown.promptPush()
                
                // Wait a bit for Push Primer to fully appear
                await new Promise((resolve) => setTimeout(resolve, 500))
                
                // Wait for user to interact with the Push Primer
                // Poll for permission change - keep checking until permission is granted or timeout
                let permissionGranted = false
                
                // First, wait 15 seconds to ensure Push Primer is visible and user has time to interact
                // DO NOT redirect during this time
                for (let i = 0; i < 15; i++) {
                  await new Promise((resolve) => setTimeout(resolve, 1000))
                  
                  // Check if permission was granted during the wait (user might click quickly)
                  try {
                    const currentPermission = await window.OneSignal.Notifications.permissionNative
                    if (currentPermission) {
                      permissionGranted = true
                      // Still wait the full 15 seconds to ensure Push Primer was visible
                      const remainingSeconds = 15 - i - 1
                      if (remainingSeconds > 0) {
                        await new Promise((resolve) => setTimeout(resolve, remainingSeconds * 1000))
                      }
                      break
                    }
                  } catch (error) {
                    // Continue waiting
                  }
                }
                
                // Now start checking for permission (after Push Primer has been visible for 15 seconds)
                if (!permissionGranted) {
                  for (let i = 0; i < 60; i++) {
                    await new Promise((resolve) => setTimeout(resolve, 1000))
                    
                    try {
                      const currentPermission = await window.OneSignal.Notifications.permissionNative
                      if (currentPermission) {
                        permissionGranted = true
                        break
                      }
                    } catch (error) {
                      // Continue polling
                    }
                  }
                }
                
                // Only proceed if permission was granted (user clicked allow)
                // AND we've waited at least 15 seconds
                if (permissionGranted) {
                  setIsSubscribed(true)
                  
                  // Get Player ID and save to Supabase
                  let playerId = null
                  for (let i = 0; i < 3; i++) {
                    try {
                      playerId = await window.OneSignal.User.PushSubscription.id
                      if (playerId) break
                    } catch (error) {
                      // Ignore errors and retry
                    }
                    if (i < 2) {
                      await new Promise((resolve) => setTimeout(resolve, 1000))
                    }
                  }

                  if (playerId) {
                    const supabase = createClient()
                    await supabase
                      .from('profiles')
                      .upsert(
                        { onesignal_id: playerId },
                        { onConflict: 'onesignal_id' }
                      )
                    
                    // Redirect after successful registration (page refresh)
                    // Only redirect if permission was granted AND we've waited
                    const redirectUrl = 'https://utage-system.com/p/zwvVkDBzc2wb'
                    if (redirectUrl.startsWith('https://')) {
                      await new Promise((resolve) => setTimeout(resolve, 1000))
                      window.location.href = redirectUrl
                    }
                  }
                }
              } catch (error: any) {
                // Ignore errors (domain configuration or user denied)
                console.error('Auto prompt error:', error)
              }
            }
          }
        } catch (error) {
          // Ignore errors (waiting for domain configuration)
          // Treat as initialized (enable button)
          setIsInitialized(true)
        }
      } catch (error) {
        // Ignore errors (waiting for domain configuration)
        // Treat as initialized (enable button)
        setIsInitialized(true)
      }
    }

    checkOneSignalStatus()
  }, [isPwa])

  // Fetch unread notification count
  useEffect(() => {
    if (!isPwa || !isSubscribed) return

    const fetchUnreadCount = async () => {
      try {
        await waitForOneSignal()

        await new Promise((resolve) => setTimeout(resolve, 1000))

        if (!window.OneSignal) return

        let playerId: string | null = null
        try {
          playerId = await window.OneSignal.User.PushSubscription.id
        } catch (error) {
          return
        }

        if (!playerId) return

        const response = await fetch(
          `/api/notifications?onesignal_id=${encodeURIComponent(playerId)}`
        )

        if (response.ok) {
          const data = await response.json()
          setUnreadCount(data.unreadCount || 0)
        }
      } catch (error) {
        console.error('Failed to fetch unread count:', error)
      }
    }

    fetchUnreadCount()
    // Update every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [isPwa, isSubscribed])

  const handleSubscribe = async () => {
    setIsLoading(true)
    setMessage('')

    try {
      // Check if OneSignal is available
      await waitForOneSignal()
      
      if (!window.OneSignal) {
        setMessage('Notification service is being prepared. Please wait a moment and try again.')
        setIsLoading(false)
        return
      }

      // Request notification permission
      try {
        await window.OneSignal.Slidedown.promptPush()
      } catch (error: any) {
        // Show user-friendly message for domain configuration errors
        if (error?.message?.includes('Can only be used on')) {
          setMessage('Notification feature is currently being prepared. Please wait a moment.')
          setIsLoading(false)
          return
        }
        throw error
      }

      // Wait a bit before checking permission status
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Check if permission was granted
      let permission = false
      try {
        permission = await window.OneSignal.Notifications.permissionNative
      } catch (error) {
        // Ignore errors
      }
      
      if (!permission) {
        setMessage('Notification permission was not granted. Please enable notifications in your settings.')
        setIsLoading(false)
        return
      }

      // Get Player ID (retry multiple times)
      let playerId = null
      for (let i = 0; i < 3; i++) {
        try {
          playerId = await window.OneSignal.User.PushSubscription.id
          if (playerId) break
        } catch (error) {
          // Ignore errors and retry
        }
        if (i < 2) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }

      if (!playerId) {
        setMessage('Notification feature is currently being prepared. Please wait a moment.')
        setIsLoading(false)
        return
      }

      // Save to Supabase
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .upsert(
          { onesignal_id: playerId },
          { onConflict: 'onesignal_id' }
        )

      if (error) {
        console.error('Supabase error:', error)
        setMessage('Registration failed. Please try again.')
        setIsLoading(false)
        return
      }

      setIsSubscribed(true)
      setMessage('Registered successfully!')
      
      // Redirect to specified URL after notification permission (after showing alert)
      // Security check: only redirect to allowed domains
      const redirectUrl = 'https://utage-system.com/p/zwvVkDBzc2wb'
      if (redirectUrl.startsWith('https://')) {
        // Show success message before redirecting (wait 1 second)
        await new Promise((resolve) => setTimeout(resolve, 1000))
        window.location.href = redirectUrl
      }
    } catch (error: any) {
      // Show user-friendly message for domain configuration errors
      if (error?.message?.includes('Can only be used on')) {
        setMessage('Notification feature is currently being prepared. Please wait a moment.')
      } else {
        console.error('Subscribe error:', error)
        setMessage('An error occurred during notification registration. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Notification history link (when registered in PWA mode) */}
        {isPwa && isSubscribed && (
          <div className="absolute top-4 right-4">
            <button
              onClick={() => {
                window.location.href = 'https://utage-system.com/p/wuSiFKxuyU5T'
              }}
              className="relative inline-flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg hover:border-[#00f0ff]/50 transition-all"
            >
              <Bell className="w-5 h-5 text-[#00f0ff]" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#00f0ff] text-black text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Main content */}
        <Bell className="w-16 h-16 text-[#00f0ff] mx-auto mb-6" />
        <h1 className="text-2xl font-bold mb-4">Receive Notifications</h1>
        <p className="text-gray-400 mb-8 text-sm">
          Add to home screen and use as an app
        </p>

        {/* Message display */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.includes('success') || message.includes('Registered')
                ? 'bg-green-900/50 border border-green-500/50 text-green-300'
                : 'bg-red-900/50 border border-red-500/50 text-red-300'
            }`}
          >
            {message}
          </div>
        )}

        {/* Show loading message while processing in PWA mode */}
        {isPwa && !isSubscribed && (
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#00f0ff] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400 text-sm">
              Please wait for the label to appear below.
              <br />
              Please allow notifications.
            </p>
          </div>
        )}

        {/* Already registered in PWA mode - don't show message if already subscribed */}
        {/* Message is only shown after user explicitly subscribes */}

        {/* Browser mode */}
        {!isPwa && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-4">
              Notification features are limited to the app version.
              <br />
              Please "Add to Home Screen" from the browser menu.
            </p>
            <div className="w-full max-w-sm mx-auto space-y-6">
              <img
                src="/IMG_8348.jpg"
                alt="How to add to home screen"
                className="w-full h-auto rounded-lg"
              />
              <img
                src="/IMG_8347.jpg"
                alt="Add to Home Screen option"
                className="w-full h-auto rounded-lg"
              />
              <img
                src="/IMG_8350.jpg"
                alt="Home screen confirmation"
                className="w-full h-auto rounded-lg"
              />
            </div>
            <p className="text-gray-400 text-sm mt-6 text-center">
              After adding to iPhone home screen, please wait for the label to appear below.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}