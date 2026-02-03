import { useState } from 'react'
import SearchBar from '@/components/search/SearchBar'
import SearchFilters from '@/components/search/SearchFilters'
import ResultGrid from '@/components/search/ResultGrid'
import { useNaturalLanguageSearch, useAdvancedSearch } from '@/hooks/useSearch'
import { SearchResultItem, AdvancedSearchQuery } from '@/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Loader2 } from 'lucide-react'

interface FilterState {
  gender: string | null
  upper_color: string | null
  lower_color: string | null
  min_confidence: number
}

const defaultFilters: FilterState = {
  gender: null,
  upper_color: null,
  lower_color: null,
  min_confidence: 0.6,
}

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState('natural')
  const [filters, setFilters] = useState<FilterState>(defaultFilters)

  const nlSearch = useNaturalLanguageSearch()
  const advSearch = useAdvancedSearch()

  const handleNaturalSearch = (query: string) => {
    nlSearch.search(query)
  }

  const handleAdvancedSearch = () => {
    const query: AdvancedSearchQuery = {
      ...filters,
      limit: 50,
      sort_by: 'confidence',
      sort_order: 'desc',
    }
    advSearch.search(query)
  }

  const handleResultClick = (result: SearchResultItem) => {
    // Could open a modal or navigate to detail view
    console.log('Result clicked:', result)
  }

  const results = activeTab === 'natural' ? nlSearch.results : advSearch.results
  const isSearching = activeTab === 'natural' ? nlSearch.isSearching : advSearch.isSearching

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Search</h1>
        <p className="text-muted-foreground">
          Find people by attributes using natural language or filters
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="natural">
            <Search className="h-4 w-4 mr-2" />
            Natural Language
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </TabsTrigger>
        </TabsList>

        <TabsContent value="natural" className="space-y-4">
          <SearchBar
            onSearch={handleNaturalSearch}
            isSearching={nlSearch.isSearching}
          />

          {/* Show parsed query */}
          {nlSearch.results?.parsed_attributes && (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Parsed attributes:
                </p>
                <div className="flex flex-wrap gap-2">
                  {nlSearch.results.parsed_attributes.gender && (
                    <Badge variant="secondary">
                      Gender: {nlSearch.results.parsed_attributes.gender}
                    </Badge>
                  )}
                  {nlSearch.results.parsed_attributes.upper_color && (
                    <Badge variant="secondary">
                      Upper: {nlSearch.results.parsed_attributes.upper_color}
                    </Badge>
                  )}
                  {nlSearch.results.parsed_attributes.lower_color && (
                    <Badge variant="secondary">
                      Lower: {nlSearch.results.parsed_attributes.lower_color}
                    </Badge>
                  )}
                  {!nlSearch.results.parsed_attributes.gender &&
                    !nlSearch.results.parsed_attributes.upper_color &&
                    !nlSearch.results.parsed_attributes.lower_color && (
                      <Badge variant="outline">No specific attributes detected</Badge>
                    )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <SearchFilters
            filters={filters}
            onFilterChange={setFilters}
            onClear={() => setFilters(defaultFilters)}
          />
          <Button onClick={handleAdvancedSearch} disabled={advSearch.isSearching}>
            {advSearch.isSearching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching
              </>
            ) : (
              'Search'
            )}
          </Button>
        </TabsContent>
      </Tabs>

      {/* Results */}
      {isSearching && (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {results && !isSearching && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Found {results.total_count} results
            </p>
          </div>
          <ResultGrid results={results.results} onResultClick={handleResultClick} />
        </div>
      )}
    </div>
  )
}
