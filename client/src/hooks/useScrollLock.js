import { useEffect } from 'react'

export default function useScrollLock(locked) {
  useEffect(() => {
    if (!locked) return

    document.documentElement.dataset.scrollLocked = ''
    document.body.style.overflow = 'hidden'

    return () => {
      delete document.documentElement.dataset.scrollLocked
      document.body.style.overflow = ''
    }
  }, [locked])
}
