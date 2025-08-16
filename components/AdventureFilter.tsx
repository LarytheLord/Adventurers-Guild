"use client"
import React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AdventureFilterProps {
  filter: { difficulty: string; category: string }
  setFilter: (value: { difficulty: string; category: string }) => void
  categories: string[]
  difficulties: string[]
}

const AdventureFilter: React.FC<AdventureFilterProps> = ({
  filter,
  setFilter,
  categories,
  difficulties,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-4">
      <Select
        value={filter.difficulty}
        onValueChange={(value) => setFilter({ ...filter, difficulty: value })}
      >
        <SelectTrigger className="flex-1 p-3 rounded-lg border border-border bg-card text-card-foreground
          focus:outline-none focus:ring-2 focus:ring-primary transition-shadow duration-500 shadow-sm
          hover:shadow-md">
          <SelectValue placeholder="All Difficulties" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Difficulties</SelectItem>
          {difficulties.filter(d => d !== 'all').map((d) => (
            <SelectItem key={d} value={d}>
              {d}-Rank
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {categories.length > 0 && (
        <Select
          value={filter.category}
          onValueChange={(value) => setFilter({ ...filter, category: value })}
        >
          <SelectTrigger className="flex-1 p-3 rounded-lg border border-border bg-card text-card-foreground
            focus:outline-none focus:ring-2 focus:ring-primary transition-shadow duration-500 shadow-sm
            hover:shadow-md">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}

export default AdventureFilter