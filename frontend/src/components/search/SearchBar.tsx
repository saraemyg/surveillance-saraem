import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Loader2 } from 'lucide-react'

interface SearchBarProps {
  onSearch: (query: string) => void
  isSearching?: boolean
  placeholder?: string
}

export default function SearchBar({
  onSearch,
  isSearching = false,
  placeholder = 'Search for a person (e.g., "male wearing red shirt")',
}: SearchBarProps) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10"
          disabled={isSearching}
        />
      </div>
      <Button type="submit" disabled={!query.trim() || isSearching}>
        {isSearching ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Searching
          </>
        ) : (
          'Search'
        )}
      </Button>
    </form>
  )
}
