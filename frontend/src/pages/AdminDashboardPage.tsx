import { useQuery } from '@tanstack/react-query'
import { metricsService } from '@/services'
import MetricsCard from '@/components/dashboard/MetricsCard'
import { GenderChart, ColorChart, DetectionsChart } from '@/components/dashboard/PerformanceChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateTime } from '@/utils/formatters'
import { Video, Users, Gauge, Clock, Loader2, TrendingUp } from 'lucide-react'

export default function AdminDashboardPage() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['metricsSummary'],
    queryFn: metricsService.getSummary,
  })

  const { data: videoMetrics } = useQuery({
    queryKey: ['videoMetrics'],
    queryFn: () => metricsService.getVideoMetrics(20),
  })

  const { data: attributeMetrics } = useQuery({
    queryKey: ['attributeMetrics'],
    queryFn: metricsService.getAttributeMetrics,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const detectionsData = videoMetrics?.map((v) => ({
    name: v.filename.length > 15 ? v.filename.slice(0, 12) + '...' : v.filename,
    detections: v.total_detections,
  })) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          System performance metrics and analytics
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricsCard
          title="Total Videos"
          value={summary?.total_videos || 0}
          icon={Video}
          description="Processed videos"
        />
        <MetricsCard
          title="Total Detections"
          value={summary?.total_detections || 0}
          icon={Users}
          description="Person detections"
        />
        <MetricsCard
          title="Average FPS"
          value={summary?.average_fps?.toFixed(2) || '0.00'}
          icon={Gauge}
          description="Processing speed"
        />
        <MetricsCard
          title="Area Reduction"
          value={`${summary?.average_area_reduction?.toFixed(1) || 0}%`}
          icon={TrendingUp}
          description="Segmentation efficiency"
        />
        <MetricsCard
          title="Processing Time"
          value={`${summary?.total_processing_time?.toFixed(0) || 0}s`}
          icon={Clock}
          description="Total time"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {attributeMetrics && (
          <GenderChart data={attributeMetrics.gender_distribution} />
        )}
        {detectionsData.length > 0 && (
          <DetectionsChart data={detectionsData} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {attributeMetrics && attributeMetrics.upper_color_distribution.length > 0 && (
          <ColorChart
            data={attributeMetrics.upper_color_distribution}
            title="Upper Body Colors"
          />
        )}
        {attributeMetrics && attributeMetrics.lower_color_distribution.length > 0 && (
          <ColorChart
            data={attributeMetrics.lower_color_distribution}
            title="Lower Body Colors"
          />
        )}
      </div>

      {/* Video Metrics Table */}
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
                  <th className="text-left py-3 px-4 font-medium">Processing Time</th>
                  <th className="text-left py-3 px-4 font-medium">Area Reduction</th>
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {videoMetrics?.map((metric) => (
                  <tr key={metric.video_id} className="border-b last:border-0">
                    <td className="py-3 px-4">
                      <span className="truncate max-w-[200px] block" title={metric.filename}>
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
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
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
