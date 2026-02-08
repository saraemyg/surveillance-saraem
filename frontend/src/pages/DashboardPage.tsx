import { useQuery } from '@tanstack/react-query'
import { metricsService } from '@/services'
import MetricsCard from '@/components/dashboard/MetricsCard'
import RecentActivityList from '@/components/dashboard/RecentActivity'
import { ColorChart, DetectionsChart } from '@/components/dashboard/PerformanceChart'
import { Video, Users, Gauge, Clock } from 'lucide-react'
import { Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['metricsSummary'],
    queryFn: metricsService.getSummary,
  })

  const { data: videoMetrics } = useQuery({
    queryKey: ['videoMetrics'],
    queryFn: () => metricsService.getVideoMetrics(10),
  })

  const { data: attributeMetrics } = useQuery({
    queryKey: ['attributeMetrics'],
    queryFn: metricsService.getAttributeMetrics,
  })

  const { data: recentActivity } = useQuery({
    queryKey: ['recentActivity'],
    queryFn: () => metricsService.getRecentActivity(5),
  })

  if (summaryLoading) {
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
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your surveillance system
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          value={summary?.average_fps?.toFixed(1) || '0.0'}
          icon={Gauge}
          description="Processing speed"
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

      {/* Recent Activity */}
      {recentActivity && <RecentActivityList activities={recentActivity} />}
    </div>
  )
}
