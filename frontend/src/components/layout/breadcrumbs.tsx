"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { motion } from "motion/react"

export interface BreadcrumbItem {
  label: string
  href?: string
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-[13px] text-foreground/40 mb-4"
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="size-3 shrink-0" />}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-foreground transition-colors duration-150 truncate max-w-[200px]"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground/60 truncate max-w-[200px]">{item.label}</span>
            )}
          </span>
        )
      })}
    </motion.nav>
  )
}
