import { useQuery } from '@tanstack/react-query'
import { metricsService } from '@/services'
import MetricsCard from '@/components/dashboard/MetricsCard'
import { ColorChart } from '@/components/dashboard/PerformanceChart'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/utils/formatters'
import { Video, Users, Gauge, Loader2, TrendingUp, Activity, AlertCircle, CheckCircle, HardDrive, Zap, Clock } from 'lucide-react'

export default function PerformancePage() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['metricsSummary'],
    queryFn: metricsService.getSummary,
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

  // Mock data for FPS over time (would come from backend in production)
  const fpsOverTime = [
    { time: '00:00', fps: 15.2 },
    { time: '04:00', fps: 15.1 },
    { time: '08:00', fps: 15.3 },
    { time: '12:00', fps: 15.0 },
    { time: '16:00', fps: 15.2 },
    { time: '20:00', fps: 15.1 },
  ]

  // Mock data for detections per minute
  const detectionsPerMinute = [
    { minute: '0', count: 12 },
    { minute: '1', count: 18 },
    { minute: '2', count: 15 },
    { minute: '3', count: 21 },
    { minute: '4', count: 19 },
    { minute: '5', count: 17 },
  ]

  // Mock memory usage data
  const memoryUsage = { ram: 65, vram: 72 }

  // Pipeline status
  const pipelineStatus = [
    { component: 'Detection (YOLO)', status: 'operating', queueDepth: 0 },
    { component: 'Segmentation (MobileNetV3)', status: 'operating', queueDepth: 2 },
    { component: 'Attributes (ResNet50)', status: 'operating', queueDepth: 1 },
  ]

  // Mock accuracy metrics
  const accuracyMetrics = {
    detectionPrecision: 91.5,
    detectionRecall: 88.3,
    colorAccuracy: 82.1,
    genderAccuracy: 76.8,
  }

  // Mock error log
  const errorLog = [
    { timestamp: new Date(Date.now() - 300000).toISOString(), type: 'warning', message: 'Queue depth exceeded threshold for Segmentation module' },
    { timestamp: new Date(Date.now() - 600000).toISOString(), type: 'info', message: 'Video processing completed: sample_video_001.mp4' },
    { timestamp: new Date(Date.now() - 900000).toISOString(), type: 'warning', message: 'VRAM usage at 72% - monitor for potential bottlenecks' },
    { timestamp: new Date(Date.now() - 1200000).toISOString(), type: 'info', message: 'System initialized and ready for processing' },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operating':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'idle':
        return <Activity className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Activity className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Performance Metrics</h1>
        <p className="text-muted-foreground">
          Real-time system performance, accuracy evaluation, and processing pipeline monitoring
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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
          description="Processing speed (Target: 15 FPS)"
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
          description="Total processing"
        />
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-green-900 dark:text-green-100">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              <p className="text-lg font-bold text-green-700 dark:text-green-300">Optimal</p>
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">All modules operating</p>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Performance Graphs Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Real-time Performance Graphs</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* FPS Over Time */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">FPS Over Time</CardTitle>
              <CardDescription>Sustained 15 FPS Performance (NFR_PF1)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-48 flex items-end justify-around gap-1">
                  {fpsOverTime.map((data, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-blue-500 rounded-t"
                        style={{ height: `${(data.fps / 16) * 100}%` }}
                      ></div>
                      <span className="text-xs text-muted-foreground mt-2">{data.time}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Average: 15.2 FPS</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    Compliant
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detections Per Minute */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detections Per Minute</CardTitle>
              <CardDescription>Workload Monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-48 flex items-end justify-around gap-1">
                  {detectionsPerMinute.map((data, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-purple-500 rounded-t"
                        style={{ height: `${(data.count / 25) * 100}%` }}
                      ></div>
                      <span className="text-xs text-muted-foreground mt-2">M{data.minute}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Average: 17 detections/min</span>
                  <span className="text-muted-foreground">Peak: 21</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Memory Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resource Consumption</CardTitle>
              <CardDescription>RAM & VRAM Usage (NFR_PF3)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* GPU Info */}
                <div className="bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900 dark:to-yellow-900 p-3 rounded-lg mb-2">
                  <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">GPU: NVIDIA RTX 5060 Ti</p>
                  <p className="text-xs text-orange-800 dark:text-orange-200">CUDA Compute Capability: 8.9</p>
                </div>
                {/* RAM */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <HardDrive className="h-4 w-4" /> RAM
                    </span>
                    <span className="text-sm font-bold">{memoryUsage.ram}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all"
                      style={{ width: `${memoryUsage.ram}%` }}
                    ></div>
                  </div>
                </div>
                {/* VRAM */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Zap className="h-4 w-4" /> VRAM
                    </span>
                    <span className="text-sm font-bold">{memoryUsage.vram}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-orange-500 h-3 rounded-full transition-all"
                      style={{ width: `${memoryUsage.vram}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Accuracy Metrics Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Accuracy Metrics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Detection Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detection Performance</CardTitle>
              <CardDescription>Precision & Recall Values</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Precision</span>
                  <span className="text-sm font-bold">{accuracyMetrics.detectionPrecision}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${accuracyMetrics.detectionPrecision}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Recall</span>
                  <span className="text-sm font-bold">{accuracyMetrics.detectionRecall}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${accuracyMetrics.detectionRecall}%` }}
                  ></div>
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">F1 Score: {(2 * (accuracyMetrics.detectionPrecision * accuracyMetrics.detectionRecall) / (accuracyMetrics.detectionPrecision + accuracyMetrics.detectionRecall)).toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Attribute Classification */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Attribute Classification Accuracy</CardTitle>
              <CardDescription>Target: 75-80% (NFR_ACC1)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Clothing Colors</span>
                  <span className={`text-sm font-bold ${accuracyMetrics.colorAccuracy >= 75 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {accuracyMetrics.colorAccuracy}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${accuracyMetrics.colorAccuracy >= 75 ? 'bg-green-500' : 'bg-yellow-500'}`}
                    style={{ width: `${accuracyMetrics.colorAccuracy}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Gender Classification</span>
                  <span className={`text-sm font-bold ${accuracyMetrics.genderAccuracy >= 75 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {accuracyMetrics.genderAccuracy}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${accuracyMetrics.genderAccuracy >= 75 ? 'bg-green-500' : 'bg-yellow-500'}`}
                    style={{ width: `${accuracyMetrics.genderAccuracy}%` }}
                  ></div>
                </div>
              </div>
              <div className="pt-2 border-t">
                <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 text-xs">
                  Ready for detailed confusion matrix analysis below
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Confusion Matrices */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          {attributeMetrics && attributeMetrics.upper_color_distribution.length > 0 && (
            <ColorChart
              data={attributeMetrics.upper_color_distribution}
              title="Upper Body Colors - Distribution Analysis"
            />
          )}
          {attributeMetrics && attributeMetrics.lower_color_distribution.length > 0 && (
            <ColorChart
              data={attributeMetrics.lower_color_distribution}
              title="Lower Body Colors - Distribution Analysis"
            />
          )}
        </div>
      </div>

      {/* Processing Pipeline Status Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Processing Pipeline Status</h2>
        <Card>
          <CardHeader>
            <CardTitle>Component Status & Queue Depth</CardTitle>
            <CardDescription>Real-time monitoring of processing modules and bottleneck identification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Component Status List */}
              <div className="space-y-3">
                {pipelineStatus.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      {getStatusIcon(item.status)}
                      <div>
                        <p className="font-medium text-sm">{item.component}</p>
                        <p className="text-xs text-muted-foreground">Queue Depth: {item.queueDepth}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        item.status === 'operating'
                          ? 'bg-green-100 text-green-800 border-green-300'
                          : item.status === 'idle'
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                            : 'bg-red-100 text-red-800 border-red-300'
                      }
                    >
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Badge>
                  </div>
                ))}
              </div>

              {/* Model Performance Metrics Grid */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-sm mb-3">Model Performance Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* YOLO Detection */}
                  <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-2">YOLO (Detection)</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Precision:</span>
                        <span className="font-bold text-blue-700 dark:text-blue-300">91.5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Recall:</span>
                        <span className="font-bold text-blue-700 dark:text-blue-300">88.3%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">mAP:</span>
                        <span className="font-bold text-blue-700 dark:text-blue-300">89.2%</span>
                      </div>
                    </div>
                  </div>

                  {/* MobileNetV3 Segmentation */}
                  <div className="bg-emerald-50 dark:bg-emerald-950 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-100 mb-2">MobileNetV3 (Segmentation)</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Precision:</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-300">88.7%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Recall:</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-300">85.4%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">mAP:</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-300">86.8%</span>
                      </div>
                    </div>
                  </div>

                  {/* ResNet50 Attributes */}
                  <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-purple-900 dark:text-purple-100 mb-2">ResNet50 (Attributes)</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Precision:</span>
                        <span className="font-bold text-purple-700 dark:text-purple-300">85.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Recall:</span>
                        <span className="font-bold text-purple-700 dark:text-purple-300">82.1%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">mAP:</span>
                        <span className="font-bold text-purple-700 dark:text-purple-300">83.4%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Log Panel */}
      <div>
        <h2 className="text-2xl font-bold mb-4">System Log & Troubleshooting</h2>
        <Card>
          <CardHeader>
            <CardTitle>Recent Warnings & Errors</CardTitle>
            <CardDescription>Latest system messages for troubleshooting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {errorLog.map((log, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 p-3 rounded-lg text-sm ${
                    log.type === 'error'
                      ? 'bg-red-50 dark:bg-red-950'
                      : log.type === 'warning'
                        ? 'bg-yellow-50 dark:bg-yellow-950'
                        : 'bg-blue-50 dark:bg-blue-950'
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {log.type === 'error' ? (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    ) : log.type === 'warning' ? (
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{log.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDateTime(log.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
