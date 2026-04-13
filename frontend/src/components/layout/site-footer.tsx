import { Footer } from "@/components/ui/footer"
import { Code, MessageSquare } from "lucide-react"

export function SiteFooter() {
  const logo = (
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shrink-0">
      <span className="text-primary-foreground font-bold text-xs">SH</span>
    </div>
  )

  return (
    <Footer
      brandName="SkillHub"
      logo={logo}
      tagline="AI Agent Skills Marketplace"
      mainLinks={[
        { label: "Home", href: "/" },
        { label: "Skills", href: "/skills" },
        { label: "Dashboard", href: "/dashboard" },
      ]}
      legalLinks={[]}
      socialLinks={[
        { label: "GitHub", href: "https://github.com", icon: Code },
      ]}
      copyright="© 2026 SkillHub. All rights reserved."
    />
  )
}
