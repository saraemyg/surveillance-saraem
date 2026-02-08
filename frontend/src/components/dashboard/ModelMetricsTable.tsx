import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

interface ModelMetric {
  model: string
  precision: number
  recall: number
  mAP: number
  color: string
  bgColor: string
}

interface ModelMetricsTableProps {
  data?: ModelMetric[]
}

export default function ModelMetricsTable({ data }: ModelMetricsTableProps) {
  // Mock data if not provided
  const metricsData = data || [
    {
      model: 'YOLO (Detection)',
      precision: 91.5,
      recall: 89.2,
      mAP: 90.3,
      color: 'text-blue-700 dark:text-blue-300',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      model: 'MobileNetV3 (Segmentation)',
      precision: 88.4,
      recall: 86.7,
      mAP: 87.5,
      color: 'text-emerald-700 dark:text-emerald-300',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950',
    },
    {
      model: 'ResNet50 (Attributes)',
      precision: 85.6,
      recall: 83.2,
      mAP: 84.4,
      color: 'text-purple-700 dark:text-purple-300',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Model Performance Metrics
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Accuracy evaluation and processing pipeline monitoring
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metricsData.map((metric, index) => (
            <div key={index} className={`${metric.bgColor} p-4 rounded-lg border`}>
              <div className="mb-4">
                <h3 className={`text-sm font-semibold ${metric.color} mb-4`}>
                  {metric.model}
                </h3>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">Precision</span>
                    <span className="text-sm font-bold">{metric.precision}%</span>
                  </div>
                  <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${metric.precision}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">Recall</span>
                    <span className="text-sm font-bold">{metric.recall}%</span>
                  </div>
                  <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-emerald-500"
                      style={{ width: `${metric.recall}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">mAP</span>
                    <span className="text-sm font-bold">{metric.mAP}%</span>
                  </div>
                  <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-purple-500"
                      style={{ width: `${metric.mAP}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
