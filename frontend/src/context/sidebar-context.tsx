"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useIsMobile } from "@/hooks/use-media-query"

interface SidebarContextType {
  isExpanded: boolean
  toggle: () => void
  isMobile: boolean
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (!isMobile) setMobileOpen(false)
  }, [isMobile])

  function toggle() {
    setIsExpanded((prev) => !prev)
  }

  return (
    <SidebarContext.Provider value={{ isExpanded, toggle, isMobile, mobileOpen, setMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider")
  return ctx
}
