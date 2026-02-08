import { Eye, ThumbsDown, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type BehaviorType = 'RUN' | 'BEND' | 'STAND' | 'WALK' | 'LAY' | 'SIT' | 'FIGHT'
type PriorityType = 'HIGH' | 'MEDIUM' | 'LOW' | 'PENDING'

interface AlertNotificationCardProps {
  id: string
  behavior: BehaviorType
  cameraName: string
  confidence: number
  priority: PriorityType
  timestamp: string
  onAcknowledge?: (id: string) => void
  onFalsePositive?: (id: string) => void
  onViewCamera?: (cameraId: string) => void
  cameraId: string
  acknowledged?: boolean
}

export default function AlertNotificationCard({
  id,
  behavior,
  cameraName,
  confidence,
  priority,
  timestamp,
  onAcknowledge,
  onFalsePositive,
  onViewCamera,
  cameraId,
  acknowledged = false,
}: AlertNotificationCardProps) {
  const getBehaviorColor = (behavior: BehaviorType) => {
    switch (behavior) {
      case 'RUN':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
      case 'BEND':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
      case 'STAND':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
      case 'WALK':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
      case 'LAY':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
      case 'SIT':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
      case 'FIGHT':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
    }
  }

  const getPriorityColor = (priority: PriorityType) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
      case 'MEDIUM':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
      case 'LOW':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
      case 'PENDING':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
    }
  }

  const getConfidenceColor = (conf: number) => {
    if (conf > 0.8) return 'text-green-600'
    if (conf > 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div
      className={`border-l-4 rounded-lg p-3 space-y-2 transition-all ${
        acknowledged
          ? 'opacity-60 border-gray-400 bg-gray-50 dark:bg-gray-900'
          : 'border-blue-500 bg-white dark:bg-slate-900 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={`text-xs font-semibold ${getBehaviorColor(behavior)}`}>
              {behavior}
            </Badge>
            <span className="text-xs text-muted-foreground">{timestamp}</span>
          </div>
          <p className="text-sm font-medium">{cameraName}</p>
        </div>
        {acknowledged && (
          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          <span className={`${getConfidenceColor(confidence)}`}>
            {(confidence * 100).toFixed(0)}%
          </span>
          <span className="text-muted-foreground ml-1">confidence</span>
        </span>
        <Badge className={`text-xs font-semibold ${getPriorityColor(priority)}`}>
          {priority}
        </Badge>
      </div>

      <div className="flex items-center gap-1 pt-1">
        <Button
          size="sm"
          variant="default"
          className="h-7 text-xs flex-1"
          onClick={() => onAcknowledge?.(id)}
        >
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Acknowledge
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs flex-1"
          onClick={() => onFalsePositive?.(id)}
        >
          <ThumbsDown className="h-3 w-3 mr-1" />
          False
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
          onClick={() => onViewCamera?.(cameraId)}
        >
          <Eye className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
