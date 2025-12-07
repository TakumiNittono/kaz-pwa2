'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'

declare global {
  interface Window {
    OneSignalDeferred?: Array<(...args: any[]) => void>
    OneSignal?: any
  }
}

export default function Home() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isPwa, setIsPwa] = useState(false)
  const [hasShownPushPrimer, setHasShownPushPrimer] = useState(false)
  const [showCompletionMessage, setShowCompletionMessage] = useState(false)

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
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Check if notifications are already permitted
        try {
          if (window.OneSignal) {
            const permission = await window.OneSignal.Notifications.permissionNative
            if (permission) {
              // Already subscribed - just update state but don't show message
              setIsSubscribed(true)
              setIsInitialized(true)
              // Show completion message after 20 seconds
              setTimeout(() => {
                setShowCompletionMessage(true)
              }, 20000)
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
                  // Show completion message after 20 seconds
                  setTimeout(() => {
                    setShowCompletionMessage(true)
                  }, 20000)
                  // Don't redirect - keep showing loading screen
                  // User can stay on this page waiting for notifications
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
  }, [isPwa, hasShownPushPrimer])

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
            </button>
          </div>
        )}

        {/* Main content */}
        <Bell className="w-16 h-16 text-[#00f0ff] mx-auto mb-6" />
        <h1 className="text-2xl font-bold mb-4">Receive Notifications</h1>
        <p className="text-gray-400 mb-8 text-sm">
          Add to home screen and use as an app
        </p>

        {/* Show loading message while processing in PWA mode */}
        {/* Keep showing loading screen even after registration - waiting for notifications */}
        {isPwa && (
          <div className="text-center">
            {showCompletionMessage ? (
              <div className="mb-6 p-4 rounded-lg bg-green-900/50 border border-green-500/50 text-green-300">
                Notification Complete
              </div>
            ) : (
              <>
                <div className="w-8 h-8 border-2 border-[#00f0ff] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400 text-sm">
                  {isSubscribed ? (
                    'Waiting for notifications...'
                  ) : (
                    <>
                      Please wait for the label to appear below.
                      <br />
                      Please allow notifications.
                    </>
                  )}
                </p>
              </>
            )}
          </div>
        )}

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