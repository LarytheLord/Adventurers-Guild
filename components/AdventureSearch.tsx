"use client"
import React from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface AdventureSearchProps {
  query: string
  setQuery: (value: string) => void
}

const AdventureSearch: React.FC<AdventureSearchProps> = ({ query, setQuery }) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
      <Input
        type="text"
        placeholder="Search quests by title or description..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-10 w-full p-3 rounded-lg border border-border bg-card text-card-foreground placeholder:text-muted-foreground
          focus:outline-none focus:ring-2 focus:ring-primary transition-shadow duration-500 shadow-sm
          hover:shadow-md"
        aria-label="Search adventures by title or description"
      />
    </div>
  )
}

export default AdventureSearch