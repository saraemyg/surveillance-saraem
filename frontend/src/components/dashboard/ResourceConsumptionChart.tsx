import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

interface ResourceMetric {
  name: string
  usage: number
  color: string
  icon: string
}

interface ResourceConsumptionChartProps {
  data?: ResourceMetric[]
}

export default function ResourceConsumptionChart({
  data,
}: ResourceConsumptionChartProps) {
  // Mock data if not provided
  const chartData = data || [
    { name: 'GPU: NVIDIA RTX 5060 Ti', usage: 78, color: 'from-yellow-400 to-yellow-600', icon: '⚡' },
    { name: 'RAM', usage: 65, color: 'from-blue-400 to-blue-600', icon: '💾' },
    { name: 'VRAM', usage: 72, color: 'from-orange-400 to-orange-600', icon: '🔥' },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Resource Consumption</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              RAM & VRAM Usage (NFR: PF3)
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 px-3 py-1 rounded-full">
            <AlertCircle className="h-3 w-3" />
            Capacity 81%
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {chartData.map((resource, index) => (
          <div
            key={index}
            className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 rounded-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{resource.icon}</span>
                <span className="text-sm font-medium">{resource.name}</span>
              </div>
              <span className="text-right">
                <p className="text-xl font-bold">{resource.usage}%</p>
              </span>
            </div>
            <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 bg-gradient-to-r ${resource.color}`}
                style={{ width: `${resource.usage}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
