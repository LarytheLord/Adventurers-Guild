"use client"
import React, { useEffect, useState } from "react"

interface AdventureSearchProps {
  query: string
  setQuery: (value: string) => void
}

const AdventureSearch: React.FC<AdventureSearchProps> = ({ query, setQuery }) => {
  const [draftQuery, setDraftQuery] = useState(query)

  useEffect(() => {
    setDraftQuery(query)
  }, [query])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (draftQuery !== query) {
        setQuery(draftQuery.trimStart())
      }
    }, 250)

    return () => window.clearTimeout(timeoutId)
  }, [draftQuery, query, setQuery])

  return (
    <input
      type="text"
      placeholder="Search adventures"
      value={draftQuery}
      onChange={(e) => setDraftQuery(e.target.value)}
      maxLength={120}
      className="w-full p-3 rounded-lg border border-border bg-card text-card-foreground placeholder:text-muted-foreground
        focus:outline-none focus:ring-2 focus:ring-primary transition-shadow duration-500 shadow-sm
        hover:shadow-md"
      aria-label="Search adventures by title or description"
    />
  )
}

export default React.memo(AdventureSearch)
