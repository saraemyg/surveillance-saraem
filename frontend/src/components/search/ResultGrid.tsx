import { SearchResultItem } from '@/types'
import ResultCard from './ResultCard'
import { Card, CardContent } from '@/components/ui/card'
import { Search } from 'lucide-react'

interface ResultGridProps {
  results: SearchResultItem[]
  onResultClick?: (result: SearchResultItem) => void
}

export default function ResultGrid({ results, onResultClick }: ResultGridProps) {
  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No results found</p>
          <p className="text-sm">Try adjusting your search query or filters</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {results.map((result) => (
        <ResultCard
          key={result.detection_id}
          result={result}
          onClick={() => onResultClick?.(result)}
        />
      ))}
    </div>
  )
}
