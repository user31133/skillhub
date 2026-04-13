"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ChevronRight, X } from "lucide-react"
import { useSidebar } from "@/context/sidebar-context"
import { AnimatePresence, motion } from "motion/react"

export interface SidebarLink {
  icon: React.ElementType
  href: string
  label: string
}

export interface SidebarComponentProps {
  mainLinks: SidebarLink[]
  bottomLinks?: SidebarLink[]
  user?: {
    name: string
    email: string
    avatar_url?: string
  }
}

function SidebarNav({ mainLinks, user }: SidebarComponentProps) {
  const pathname = usePathname()
  const { isExpanded, isMobile, setMobileOpen } = useSidebar()
  const expanded = isMobile || isExpanded

  function handleLinkClick() {
    if (isMobile) setMobileOpen(false)
  }

  return (
    <>
      <nav className="flex flex-1 flex-col gap-1 py-4 px-2">
        {mainLinks.map((link) => {
          const isActive = link.href === "/skills"
            ? pathname === "/skills" || (pathname.startsWith("/skills/") && pathname !== "/skills/mine" && pathname !== "/skills/create")
            : pathname.startsWith(link.href)
          if (expanded) {
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                className={cn("flex items-center gap-3 px-3 py-2 rounded-lg transition-colors", isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground")}
              >
                <link.icon className="h-5 w-5 shrink-0" />
                <span className="text-sm font-medium truncate">{link.label}</span>
              </Link>
            )
          }
          return (
            <Link
              key={link.href}
              href={link.href}
              title={link.label}
              className={cn("flex h-10 w-10 items-center justify-center rounded-lg mx-auto transition-colors", isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground")}
            >
              <link.icon className="h-5 w-5" />
            </Link>
          )
        })}
      </nav>

      {user && (
        <div className={cn("border-t border-border p-3 bg-muted/5 overflow-hidden", !expanded && "flex justify-center px-2")}>
          <div className={cn("flex items-center", expanded ? "gap-3 w-full" : "justify-center")}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              {user.name.charAt(0)}
            </div>
            {expanded && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-semibold truncate leading-none mb-1">{user.name}</span>
                <span className="text-xs text-muted-foreground truncate">{user.email}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export function SidebarComponent({ mainLinks, bottomLinks, user }: SidebarComponentProps) {
  const { isExpanded, toggle, isMobile, mobileOpen, setMobileOpen } = useSidebar()

  if (isMobile) {
    return (
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-border bg-background shadow-xl"
            >
              <div className="flex items-center justify-between px-4 h-14 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <span className="text-primary-foreground font-bold text-xs">SH</span>
                  </div>
                  <span className="font-bold text-lg tracking-tight">SkillHub</span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <SidebarNav mainLinks={mainLinks} bottomLinks={bottomLinks} user={user} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    )
  }

  return (
    <div className={cn("fixed left-0 top-[56px] z-40 flex h-[calc(100vh-56px)] flex-col border-r border-border bg-background transition-[width] duration-300", isExpanded ? "w-52" : "w-16")}>
      <SidebarNav mainLinks={mainLinks} bottomLinks={bottomLinks} user={user} />
      <button
        onClick={toggle}
        className="absolute -right-3 top-8 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-muted text-foreground"
      >
        <ChevronRight className={cn("h-4 w-4 transition-transform", isExpanded ? "rotate-180" : "")} />
      </button>
    </div>
  )
}
