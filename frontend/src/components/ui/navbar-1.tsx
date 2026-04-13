"use client"
import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export interface NavItem {
  name: string
  href: string
}

export interface Navbar1Props {
  logo?: React.ReactNode
  items?: NavItem[]
  leftElements?: React.ReactNode
  rightElements?: React.ReactNode
  logoHref?: string
  className?: string
}

export function Navbar1({ logo, items = [], leftElements, rightElements, logoHref = "/", className }: Navbar1Props) {
  return (
    <header className={cn("sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {leftElements}
          {logo && <Link href={logoHref}> {logo} </Link>}
          {items.length > 0 && (
            <nav className="hidden md:flex gap-6 ml-2">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          )}
        </div>
        <div className="flex items-center gap-2">
          {rightElements}
        </div>
      </div>
    </header>
  )
}
