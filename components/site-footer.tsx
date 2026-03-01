import Link from "next/link"
import { Code2, Github, Twitter } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col gap-8 py-8 md:py-12">
        <div className="flex flex-col gap-6 md:flex-row md:justify-between">
          <div className="flex flex-col gap-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                <Code2 className="w-5 h-5" />
              </div>
              <span>Adventurers Guild</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              The premier quest board for student developers to earn XP, gold, and glory.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold">Guild</h3>
              <Link href="/quests" className="text-sm text-muted-foreground hover:text-foreground">Quests</Link>
              <Link href="/leaderboard" className="text-sm text-muted-foreground hover:text-foreground">Leaderboard</Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">About Us</Link>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold">Support</h3>
              <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground">FAQ</Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms</Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy</Link>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold">Social</h3>
              <Link href="https://github.com" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2">
                <Github className="w-4 h-4" /> GitHub
              </Link>
              <Link href="https://twitter.com" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2">
                <Twitter className="w-4 h-4" /> Twitter
              </Link>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-t pt-8">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Adventurers Guild. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-xs text-muted-foreground hover:underline">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-xs text-muted-foreground hover:underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}