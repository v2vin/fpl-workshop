import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
}

const KEY = 'fplw-install-hint-dismissed'

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function dismissed(): boolean {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent)

/**
 * One-time nudge to put the app on the home screen. Android fires beforeinstallprompt and we
 * can offer a real Install button; iOS has no such event, so we describe the Share-menu route.
 */
export default function InstallHint() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(() => !isStandalone() && !dismissed() && isIos())

  useEffect(() => {
    if (isStandalone() || dismissed()) return
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  if (!show) return null

  function dismiss() {
    try {
      localStorage.setItem(KEY, '1')
    } catch {
      // Private mode: the hint simply comes back next visit.
    }
    setShow(false)
  }

  async function install() {
    if (!prompt) return
    await prompt.prompt()
    dismiss()
  }

  return (
    <div className="border-pitch-200 bg-pitch-50 mb-5 flex items-start gap-3 rounded-xl border p-3 text-sm">
      <img src="/icons/icon-192.png" alt="" className="h-10 w-10 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1">
        <p className="text-pitch-900 font-semibold">Put FPL Workshop on your home screen</p>
        <p className="mt-0.5 text-stone-600">
          {prompt
            ? 'Opens full screen like an app and stays up to date on its own.'
            : 'In Safari tap Share, then “Add to Home Screen”. It opens full screen like an app.'}
        </p>
        <div className="mt-2 flex gap-3">
          {prompt && (
            <button
              type="button"
              onClick={() => void install()}
              className="bg-pitch-700 rounded-full px-3 py-1 font-medium text-white"
            >
              Install
            </button>
          )}
          <button type="button" onClick={dismiss} className="text-stone-500 underline">
            Not now
          </button>
        </div>
      </div>
    </div>
  )
}
