"use client"
import { useEffect } from "react"

export default function ScrollbarHandler() {
  useEffect(() => {
    let timeout: NodeJS.Timeout

    const handleScroll = () => {
      document.body.classList.add("show-scrollbar")

      clearTimeout(timeout)
      timeout = setTimeout(() => {
        document.body.classList.remove("show-scrollbar")
      }, 2000) // hide 2s after scroll ends
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      clearTimeout(timeout)
    }
  }, [])

  return null
}
