// To use this component, install dependencies:
// npm install next-themes lucide-react
"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "./button"
import { Sun, Moon } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const currentTheme = theme === "system" ? systemTheme : theme
  const isDark = currentTheme === "dark"

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-full transition-all duration-300 hover:scale-110"
    >
      <Sun className={`h-5 w-5 transition-all duration-300 ${isDark ? 'rotate-0 scale-100' : 'rotate-90 scale-0'}`} />
      <Moon className={`absolute h-5 w-5 transition-all duration-300 ${isDark ? '-rotate-90 scale-0' : 'rotate-0 scale-100'}`} />
    </Button>
  )
} 