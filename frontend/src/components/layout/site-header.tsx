"use client"

import { Navbar1 } from "@/components/ui/navbar-1"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Moon, Sun, LogOut, Menu } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { CossAvatar } from "@/components/ui/coss-avatar"
import { ShiftingDropdown } from "@/components/ui/shifting-dropdown"
import { useSidebar } from "@/context/sidebar-context"

function MobileMenuButton() {
  const { setMobileOpen, isMobile } = useSidebar()
  if (!isMobile) return null
  return (
    <button
      onClick={() => setMobileOpen(true)}
      className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted transition-colors"
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  )
}

interface SiteHeaderProps {
  isDashboard?: boolean
}

export function SiteHeader({ isDashboard }: SiteHeaderProps) {
  const { setTheme, theme } = useTheme()
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const logo = (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
        <span className="text-primary-foreground font-bold">SH</span>
      </div>
      <span className="font-bold text-lg tracking-tight">SkillHub</span>
    </div>
  )

  const themeToggle = (
    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )

  const userDropdownTabs = [
    {
      id: "account",
      label: user?.name || "Account",
      icon: <CossAvatar src={user?.avatar_url} alt={user?.name || ""} className="h-6 w-6" />,
      content: (
        <div className="flex flex-col gap-1 min-w-[180px]">
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <CossAvatar
              src={user?.avatar_url}
              alt={user?.name || ""}
              className="h-9 w-9"
            />
            <div className="flex flex-col">
              <span className="text-[14px] leading-tight font-medium tracking-tight text-foreground">{user?.name}</span>
              <span className="text-[12px] text-foreground/40 font-variant-numeric: tabular-nums mt-0.5">{user?.email}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-[6px] px-2 py-1.5 text-[14px] font-medium hover:bg-destructive/10 transition-colors duration-150 text-left w-full text-destructive"
          >
            <LogOut className="h-4 w-4 opacity-70" />
            Logout
          </button>
        </div>
      ),
    },
  ]

  const rightElements = (
    <div className="flex items-center gap-2 md:border-l md:border-border md:pl-4 md:ml-4">
      {themeToggle}
      {!user ? (
        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Get Started</Link>
          </Button>
        </div>
      ) : (
        <>
          <ShiftingDropdown tabs={userDropdownTabs} className="hidden md:flex" />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="md:hidden text-destructive hover:text-destructive hover:bg-destructive/10"
            aria-label="Logout"
          >
            <LogOut className="h-[1.2rem] w-[1.2rem]" />
          </Button>
        </>
      )}
    </div>
  )

  const navItems = isDashboard
    ? []
    : [
        { name: "Home", href: "/" },
        { name: "Skills", href: "/skills" },
        ...(user ? [{ name: "Dashboard", href: "/dashboard" }] : []),
      ]

  return (
    <Navbar1
      logo={logo}
      items={navItems}
      leftElements={isDashboard ? <MobileMenuButton /> : undefined}
      rightElements={rightElements}
      logoHref={isDashboard ? "/dashboard" : "/"}
    />
  )
}
