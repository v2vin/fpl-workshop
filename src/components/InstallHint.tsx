import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
}

const KEY = 'fplw-install-hint-dismissed'

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true

function dismissed(): boolean {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent)

/** One-time nudge to put the app on the home screen (design kit, "Shared prompts"). */
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
    <div className="card mb-5 p-4">
      <h2 className="display text-xl">Put FPL Workshop on your home screen</h2>
      <p className="mt-1 text-sm text-stone-600">Your league, one tap away.</p>
      {prompt ? (
        <>
          <button
            type="button"
            onClick={() => void install()}
            className="btn btn-primary mt-4 w-full"
          >
            Install on Android
          </button>
          <p className="mt-3 text-xs text-stone-600">
            In WhatsApp? Open this page in Chrome first.
          </p>
        </>
      ) : (
        <p className="mt-3 text-sm text-stone-700">
          <b>On iPhone:</b> open in Safari, tap Share, then Add to Home Screen.
        </p>
      )}
      <button type="button" onClick={dismiss} className="btn btn-text mt-1 w-full">
        Not now
      </button>
    </div>
  )
}
