import { useQuery } from '@tanstack/react-query'
import { metricsService } from '@/services'
import MetricsCard from '@/components/dashboard/MetricsCard'
import { DetectionsChart } from '@/components/dashboard/PerformanceChart'
import FpsChart from '@/components/dashboard/FpsChart'
import ResourceConsumptionChart from '@/components/dashboard/ResourceConsumptionChart'
import PipelineStatusCard from '@/components/dashboard/PipelineStatusCard'
import ModelMetricsTable from '@/components/dashboard/ModelMetricsTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateTime } from '@/utils/formatters'
import {
  Loader2,
  DownloadCloud,
  Activity,
  Zap,
  Clock,
  Server,
} from 'lucide-react'

export default function PerformanceMetricsDashboard() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['metricsSummary'],
    queryFn: metricsService.getSummary,
  })

  const { data: videoMetrics } = useQuery({
    queryKey: ['videoMetrics'],
    queryFn: () => metricsService.getVideoMetrics(20),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const detectionsData =
    videoMetrics?.map((v) => ({
      name:
        v.filename.length > 15
          ? v.filename.slice(0, 12) + '...'
          : v.filename,
      detections: v.total_detections,
    })) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Metrics</h1>
          <p className="text-muted-foreground mt-1">
            Real-time system performance, accuracy evaluation, and processing
            pipeline monitoring
          </p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition">
          <DownloadCloud className="h-4 w-4" />
          Export Report
        </button>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricsCard
          title="Active Cameras"
          value="4"
          description="All operational"
          icon={Activity}
        />
        <MetricsCard
          title="Frames Analyzed"
          value={summary?.total_videos?.toLocaleString() || '0'}
          description="Last 24 hours"
          icon={Zap}
        />
        <MetricsCard
          title="Average FPS"
          value={summary?.average_fps?.toFixed(1) || '0.0'}
          description="Target: ≥15 FPS"
          icon={Activity}
        />
        <MetricsCard
          title="Processing Time"
          value="0s"
          description="Total processing"
          icon={Clock}
        />
        <MetricsCard
          title="System Health"
          value="Optimal"
          description="All modules operating"
          icon={Server}
          className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950"
        />
      </div>

      {/* Real-time Performance Graphs Section */}
      <div>
        <h2 className="text-xl font-bold mb-4">Real-time Performance Graphs</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <FpsChart />
          {detectionsData.length > 0 && <DetectionsChart data={detectionsData} />}
          <ResourceConsumptionChart />
        </div>
      </div>

      {/* Processing Pipeline Status */}
      <div>
        <h2 className="text-xl font-bold mb-4">Processing Pipeline Status</h2>
        <PipelineStatusCard />
      </div>

      {/* Model Performance Metrics */}
      <div>
        <h2 className="text-xl font-bold mb-4">Model Performance Metrics</h2>
        <ModelMetricsTable />
      </div>

      {/* Video Processing Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Video Processing Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Video</th>
                  <th className="text-left py-3 px-4 font-medium">Detections</th>
                  <th className="text-left py-3 px-4 font-medium">Avg FPS</th>
                  <th className="text-left py-3 px-4 font-medium">
                    Processing Time
                  </th>
                  <th className="text-left py-3 px-4 font-medium">
                    Area Reduction
                  </th>
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {videoMetrics?.map((metric) => (
                  <tr key={metric.video_id} className="border-b last:border-0">
                    <td className="py-3 px-4">
                      <span
                        className="truncate max-w-[200px] block"
                        title={metric.filename}
                      >
                        {metric.filename}
                      </span>
                    </td>
                    <td className="py-3 px-4">{metric.total_detections}</td>
                    <td className="py-3 px-4">
                      {metric.avg_fps?.toFixed(2) || '-'}
                    </td>
                    <td className="py-3 px-4">
                      {metric.processing_time_seconds
                        ? `${metric.processing_time_seconds.toFixed(1)}s`
                        : '-'}
                    </td>
                    <td className="py-3 px-4">
                      {metric.area_reduction_percentage
                        ? `${metric.area_reduction_percentage.toFixed(1)}%`
                        : '-'}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {formatDateTime(metric.recorded_at)}
                    </td>
                  </tr>
                ))}
                {(!videoMetrics || videoMetrics.length === 0) && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No video metrics available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
