"use client"

import { SidebarComponent } from "@/components/ui/sidebar-component"
import { LayoutGrid, Box, FolderOpen, Plus, User, Shield } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export function AppSidebar() {
  const { user } = useAuth()

  const mainLinks = [
    { icon: LayoutGrid, href: "/dashboard", label: "Dashboard" },
    { icon: Box, href: "/skills", label: "Skills" },
    { icon: FolderOpen, href: "/skills/mine", label: "My Skills" },
    { icon: Plus, href: "/skills/create", label: "Create" },
    { icon: User, href: "/profile", label: "Profile" },
    ...(user?.role === "admin"
      ? [{ icon: Shield, href: "/admin", label: "Admin" }]
      : []),
  ]

  return (
    <SidebarComponent
      mainLinks={mainLinks}
      user={user ? {
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url
      } : undefined}
    />
  )
}
