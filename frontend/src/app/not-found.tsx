import Link from "next/link"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center text-center px-4">
        <h2 className="text-8xl font-extrabold text-primary mb-4 tracking-tighter">404</h2>
        <p className="text-2xl text-muted-foreground mb-8">Page not found</p>
        <Button size="lg" asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </main>
      <SiteFooter />
    </div>
  )
}
