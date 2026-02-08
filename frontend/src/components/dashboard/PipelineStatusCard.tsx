import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, AlertCircle } from 'lucide-react'

interface ComponentStatus {
  name: string
  model: string
  status: 'operating' | 'idle' | 'error'
  queueDepth: number
}

interface PipelineStatusCardProps {
  data?: ComponentStatus[]
}

export default function PipelineStatusCard({
  data,
}: PipelineStatusCardProps) {
  // Mock data if not provided
  const statusData = data || [
    {
      name: 'Detection (YOLO)',
      model: 'Queue: 0/5k',
      status: 'operating' as const,
      queueDepth: 0,
    },
    {
      name: 'Segmentation (MobileNetV3)',
      model: 'Queue: 0/5k',
      status: 'operating' as const,
      queueDepth: 0,
    },
    {
      name: 'Attributes (ResNet50)',
      model: 'Queue: 0/5k',
      status: 'operating' as const,
      queueDepth: 0,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operating':
        return 'text-green-600 bg-green-50 dark:bg-green-950'
      case 'idle':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950'
      case 'error':
        return 'text-red-600 bg-red-50 dark:bg-red-950'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-950'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operating':
        return (
          <span className="text-xs font-semibold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900 px-2 py-1 rounded">
            Operating
          </span>
        )
      case 'idle':
        return (
          <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded">
            Idle
          </span>
        )
      case 'error':
        return (
          <span className="text-xs font-semibold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900 px-2 py-1 rounded">
            Error
          </span>
        )
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="text-lg">Processing Pipeline Status</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Component Status & Queue Depth - real-time monitoring of processing modules and bottleneck identification
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {statusData.map((component, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-4 rounded-lg border ${getStatusColor(
                component.status
              )}`}
            >
              <div className="flex items-center gap-3">
                {component.status === 'operating' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <div>
                  <p className="font-medium text-sm">{component.name}</p>
                  <p className="text-xs text-muted-foreground">{component.model}</p>
                </div>
              </div>
              <div className="text-right">{getStatusBadge(component.status)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
