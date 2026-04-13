import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export interface FooterLink {
  label: string
  href: string
}

export interface SocialLink extends FooterLink {
  icon?: React.ElementType
}

export interface FooterProps {
  brandName: string
  logo?: React.ReactNode
  tagline?: string
  socialLinks?: SocialLink[]
  mainLinks?: FooterLink[]
  legalLinks?: FooterLink[]
  copyright?: string
  className?: string
}

export function Footer({ brandName, logo, tagline, socialLinks, mainLinks, legalLinks, copyright, className }: FooterProps) {
  return (
    <footer className={cn("border-t border-border bg-background py-12", className)}>
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              {logo}
              <span className="text-xl font-bold tracking-tight">{brandName}</span>
            </Link>
            {tagline && <p className="text-sm text-muted-foreground">{tagline}</p>}
          </div>
          
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold">Links</h4>
            <nav className="flex flex-col gap-2">
              {mainLinks?.map(link => (
                <Link key={link.href} href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {legalLinks && legalLinks.length > 0 && (
            <div className="flex flex-col gap-4">
              <h4 className="font-semibold">Legal</h4>
              <nav className="flex flex-col gap-2">
                {legalLinks.map(link => (
                  <Link key={link.href} href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          )}
          
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold">Social</h4>
            <div className="flex gap-4">
              {socialLinks?.map((link, idx) => (
                <a key={idx} href={link.href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                  {link.icon && <link.icon className="h-5 w-5" />}
                  <span className="sr-only">{link.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-12 border-t border-border pt-8 text-center sm:flex sm:justify-between sm:text-left">
          <p className="text-sm text-muted-foreground">
            {copyright || `© ${new Date().getFullYear()} ${brandName}. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  )
}
