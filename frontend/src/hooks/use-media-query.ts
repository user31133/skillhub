import { useSyncExternalStore } from "react"

export function useMediaQuery(query: string) {
  const subscribe = (callback: () => void) => {
    const matchMedia = window.matchMedia(query)
    matchMedia.addEventListener("change", callback)
    return () => matchMedia.removeEventListener("change", callback)
  }

  const getSnapshot = () => {
    return window.matchMedia(query).matches
  }

  const getServerSnapshot = () => {
    return false
  }

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function useIsMobile() {
  return useMediaQuery("(max-width: 768px)")
}
