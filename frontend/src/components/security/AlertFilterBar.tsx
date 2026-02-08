import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X, Download } from 'lucide-react'

export interface FilterOptions {
  search: string
  camera: string
  behavior: string
  priority: string
  status: string
}

interface AlertFilterBarProps {
  cameras: string[]
  behaviors: string[]
  onFilterChange: (filters: FilterOptions) => void
  onExportCsv?: () => void
}

export function AlertFilterBar({
  cameras,
  behaviors,
  onFilterChange,
  onExportCsv,
}: AlertFilterBarProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    camera: '',
    behavior: '',
    priority: '',
    status: '',
  })

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleReset = () => {
    const emptyFilters: FilterOptions = {
      search: '',
      camera: '',
      behavior: '',
      priority: '',
      status: '',
    }
    setFilters(emptyFilters)
    onFilterChange(emptyFilters)
  }

  const hasActiveFilters =
    filters.search ||
    filters.camera ||
    filters.behavior ||
    filters.priority ||
    filters.status

  return (
    <div className="space-y-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border dark:border-gray-700">
      {/* Search Bar */}
      <div>
        <Input
          placeholder="Search by Alert ID or Camera Name..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
      </div>

      {/* Filter Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Camera Filter */}
        <div>
          <Select value={filters.camera} onValueChange={(val) => handleFilterChange('camera', val)}>
            <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700">
              <SelectValue placeholder="Camera" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
              <SelectItem value="">All Cameras</SelectItem>
              {cameras.map((camera) => (
                <SelectItem key={camera} value={camera}>
                  {camera}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Behavior Filter */}
        <div>
          <Select value={filters.behavior} onValueChange={(val) => handleFilterChange('behavior', val)}>
            <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700">
              <SelectValue placeholder="Behavior" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
              <SelectItem value="">All Behaviors</SelectItem>
              {behaviors.map((behavior) => (
                <SelectItem key={behavior} value={behavior}>
                  {behavior}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Priority Filter */}
        <div>
          <Select value={filters.priority} onValueChange={(val) => handleFilterChange('priority', val)}>
            <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
              <SelectItem value="">All Priorities</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div>
          <Select value={filters.status} onValueChange={(val) => handleFilterChange('status', val)}>
            <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="NEW">New</SelectItem>
              <SelectItem value="ACKNOWLEDGED">Acknowledged</SelectItem>
              <SelectItem value="FALSE_POSITIVE">False Positive</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reset Button */}
        <div>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasActiveFilters}
            className="w-full dark:bg-gray-800 dark:border-gray-700"
          >
            <X className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <Button
          onClick={onExportCsv}
          variant="outline"
          className="dark:bg-gray-800 dark:border-gray-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>
    </div>
  )
}
