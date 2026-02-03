import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { COLOR_OPTIONS, GENDER_OPTIONS } from '@/utils/constants'
import { capitalize } from '@/utils/formatters'
import { X } from 'lucide-react'

interface FilterState {
  gender: string | null
  upper_color: string | null
  lower_color: string | null
  min_confidence: number
}

interface SearchFiltersProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  onClear: () => void
}

export default function SearchFilters({
  filters,
  onFilterChange,
  onClear,
}: SearchFiltersProps) {
  const updateFilter = (key: keyof FilterState, value: string | number | null) => {
    onFilterChange({ ...filters, [key]: value })
  }

  const hasActiveFilters =
    filters.gender || filters.upper_color || filters.lower_color

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Gender Filter */}
        <div className="space-y-2">
          <Label>Gender</Label>
          <Select
            value={filters.gender || ''}
            onValueChange={(value) => updateFilter('gender', value || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any gender</SelectItem>
              {GENDER_OPTIONS.map((gender) => (
                <SelectItem key={gender} value={gender}>
                  {capitalize(gender)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Upper Color Filter */}
        <div className="space-y-2">
          <Label>Upper Body Color</Label>
          <Select
            value={filters.upper_color || ''}
            onValueChange={(value) => updateFilter('upper_color', value || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any color" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any color</SelectItem>
              {COLOR_OPTIONS.map((color) => (
                <SelectItem key={color} value={color}>
                  {capitalize(color)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Lower Color Filter */}
        <div className="space-y-2">
          <Label>Lower Body Color</Label>
          <Select
            value={filters.lower_color || ''}
            onValueChange={(value) => updateFilter('lower_color', value || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any color" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any color</SelectItem>
              {COLOR_OPTIONS.map((color) => (
                <SelectItem key={color} value={color}>
                  {capitalize(color)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Confidence Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Minimum Confidence</Label>
          <span className="text-sm text-muted-foreground">
            {(filters.min_confidence * 100).toFixed(0)}%
          </span>
        </div>
        <Slider
          value={[filters.min_confidence * 100]}
          onValueChange={([value]) => updateFilter('min_confidence', value / 100)}
          min={0}
          max={100}
          step={5}
        />
      </div>

      {/* Quick Filter Buttons */}
      <div className="space-y-2">
        <Label>Quick Filters</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onFilterChange({ ...filters, gender: 'male', upper_color: null, lower_color: null })
            }
          >
            Male
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onFilterChange({ ...filters, gender: 'female', upper_color: null, lower_color: null })
            }
          >
            Female
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onFilterChange({ ...filters, upper_color: 'red', gender: null, lower_color: null })
            }
          >
            Red Top
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onFilterChange({ ...filters, lower_color: 'blue', gender: null, upper_color: null })
            }
          >
            Blue Pants
          </Button>
        </div>
      </div>
    </div>
  )
}
