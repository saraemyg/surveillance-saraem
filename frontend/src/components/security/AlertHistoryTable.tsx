import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, ChevronUp, ChevronDown } from 'lucide-react'

export interface AlertHistoryEntry {
  id: string
  timestamp: string
  camera: string
  behavior: string
  confidence: number
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'PENDING'
  status: 'NEW' | 'ACKNOWLEDGED' | 'FALSE_POSITIVE' | 'RESOLVED'
}

interface AlertHistoryTableProps {
  data: AlertHistoryEntry[]
  onViewCamera?: (cameraId: string) => void
  currentPage?: number
  pageSize?: number
}

type SortField = keyof AlertHistoryEntry | null
type SortOrder = 'asc' | 'desc'

export function AlertHistoryTable({
  data,
  onViewCamera,
  currentPage = 1,
  pageSize = 10,
}: AlertHistoryTableProps) {
  const [sortBy, setSortBy] = useState<SortField>('timestamp')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const getSortedData = () => {
    if (!sortBy) return data

    return [...data].sort((a, b) => {
      let aVal = a[sortBy]
      let bVal = b[sortBy]

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = (bVal as string).toLowerCase()
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }

  const sortedData = getSortedData()
  const startIdx = (currentPage - 1) * pageSize
  const paginatedData = sortedData.slice(startIdx, startIdx + pageSize)
  const totalPages = Math.ceil(sortedData.length / pageSize)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
      case 'MEDIUM':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100'
      case 'LOW':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
      case 'PENDING':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
      case 'ACKNOWLEDGED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
      case 'FALSE_POSITIVE':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100'
      case 'RESOLVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getBehaviorColor = (behavior: string) => {
    switch (behavior.toUpperCase()) {
      case 'RUN':
      case 'LAY':
      case 'FIGHT':
        return 'text-red-600 dark:text-red-400'
      case 'BEND':
        return 'text-orange-600 dark:text-orange-400'
      case 'STAND':
      case 'SIT':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'WALK':
        return 'text-green-600 dark:text-green-400'
      default:
        return 'text-gray-600'
    }
  }

  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return <div className="w-4 h-4" />
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border dark:border-gray-700 overflow-x-auto">
        {/* Table Header */}
        <div className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
          <div className="grid grid-cols-8 gap-4 px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-400">
            <div
              className="cursor-pointer select-none flex items-center gap-2 hover:text-gray-900 dark:hover:text-gray-100"
              onClick={() => handleSort('id')}
            >
              ID <SortIndicator field="id" />
            </div>
            <div
              className="cursor-pointer select-none flex items-center gap-2 hover:text-gray-900 dark:hover:text-gray-100"
              onClick={() => handleSort('timestamp')}
            >
              Timestamp <SortIndicator field="timestamp" />
            </div>
            <div
              className="cursor-pointer select-none flex items-center gap-2 hover:text-gray-900 dark:hover:text-gray-100"
              onClick={() => handleSort('camera')}
            >
              Camera <SortIndicator field="camera" />
            </div>
            <div
              className="cursor-pointer select-none flex items-center gap-2 hover:text-gray-900 dark:hover:text-gray-100"
              onClick={() => handleSort('behavior')}
            >
              Behavior <SortIndicator field="behavior" />
            </div>
            <div
              className="cursor-pointer select-none flex items-center gap-2 hover:text-gray-900 dark:hover:text-gray-100"
              onClick={() => handleSort('confidence')}
            >
              Confidence <SortIndicator field="confidence" />
            </div>
            <div
              className="cursor-pointer select-none flex items-center gap-2 hover:text-gray-900 dark:hover:text-gray-100"
              onClick={() => handleSort('priority')}
            >
              Priority <SortIndicator field="priority" />
            </div>
            <div
              className="cursor-pointer select-none flex items-center gap-2 hover:text-gray-900 dark:hover:text-gray-100"
              onClick={() => handleSort('status')}
            >
              Status <SortIndicator field="status" />
            </div>
            <div className="text-center">Actions</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y dark:divide-gray-700">
          {paginatedData.length > 0 ? (
            paginatedData.map((alert) => (
              <div
                key={alert.id}
                className="grid grid-cols-8 gap-4 px-6 py-4 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="font-mono text-xs">{alert.id}</div>
                <div className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  {alert.timestamp}
                </div>
                <div className="text-gray-700 dark:text-gray-300">{alert.camera}</div>
                <div className={`font-semibold ${getBehaviorColor(alert.behavior)}`}>
                  {alert.behavior}
                </div>
                <div className="text-gray-700 dark:text-gray-300">
                  {(alert.confidence * 100).toFixed(1)}%
                </div>
                <div>
                  <Badge className={`${getPriorityColor(alert.priority)} border-0`}>
                    {alert.priority}
                  </Badge>
                </div>
                <div>
                  <Badge className={`${getStatusColor(alert.status)} border-0`}>
                    {alert.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div className="text-center">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => onViewCamera?.(alert.camera)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No alerts found
            </div>
          )}
        </div>
      </div>

      {/* Pagination Info */}
      {data.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>
            Showing {startIdx + 1}-
            {Math.min(startIdx + pageSize, sortedData.length)} of{' '}
            {sortedData.length} results
          </span>
          <span>
            Page {currentPage} of {totalPages}
          </span>
        </div>
      )}
    </div>
  )
}
