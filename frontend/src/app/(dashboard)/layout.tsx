"use client"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/layout/site-header"
import { ProtectedRoute } from "@/components/layout/protected-route"
import { SidebarProvider, useSidebar } from "@/context/sidebar-context"
import { cn } from "@/lib/utils"

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isExpanded, isMobile } = useSidebar()
  return (
    <div className="flex flex-1 relative">
      <AppSidebar />
      <main className={cn(
        "flex-1 w-full transition-[padding-left] duration-300 ease-out",
        isMobile ? "pl-0" : isExpanded ? "pl-52" : "pl-16"
      )}>
        <div className="container p-4 md:p-6">
          <ProtectedRoute>
            {children}
          </ProtectedRoute>
        </div>
      </main>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col">
        <SiteHeader isDashboard />
        <DashboardContent>{children}</DashboardContent>
      </div>
    </SidebarProvider>
  )
}
