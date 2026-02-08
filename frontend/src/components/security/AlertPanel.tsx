import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import AlertSummaryCard from './AlertSummaryCard'
import AlertNotificationCard from './AlertNotificationCard'
import { AlertCircle, AlertTriangle, AlertOctagon, AlertCircleIcon } from 'lucide-react'

type BehaviorType = 'RUN' | 'BEND' | 'STAND' | 'WALK' | 'LAY' | 'SIT' | 'FIGHT'
type PriorityType = 'HIGH' | 'MEDIUM' | 'LOW' | 'PENDING'

interface Alert {
  id: string
  behavior: BehaviorType
  cameraId: string
  cameraName: string
  confidence: number
  priority: PriorityType
  timestamp: string
  acknowledged: boolean
  falsePositive: boolean
}

interface AlertPanelProps {
  alerts: Alert[]
  onAcknowledge?: (id: string) => void
  onFalsePositive?: (id: string) => void
  onViewCamera?: (cameraId: string) => void
}

export default function AlertPanel({
  alerts,
  onAcknowledge,
  onFalsePositive,
  onViewCamera,
}: AlertPanelProps) {
  const activeAlerts = alerts.filter(a => !a.acknowledged && !a.falsePositive)
  const highPriorityCount = activeAlerts.filter(a => a.priority === 'HIGH').length
  const mediumPriorityCount = activeAlerts.filter(a => a.priority === 'MEDIUM').length
  const lowPriorityCount = activeAlerts.filter(a => a.priority === 'LOW').length

  return (
    <Card className="flex flex-col h-full bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-lg">Alert Notifications</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden flex flex-col p-3 space-y-3">
        {/* Summary Cards */}
        <AlertSummaryCard
          title="Total Alerts"
          count={activeAlerts.length}
          description="Last 24 hours"
          icon={
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          }
          bgColor="bg-red-50 dark:bg-red-950"
          borderColor="border-red-400"
          textColor="text-red-700 dark:text-red-300"
        />

        <div className="grid grid-cols-3 gap-2">
          <AlertSummaryCard
            title="High Priority"
            count={highPriorityCount}
            description="Escalated alerts"
            icon={
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            }
            bgColor="bg-red-50 dark:bg-red-950"
            borderColor="border-red-400"
            textColor="text-red-700 dark:text-red-300"
          />
          <AlertSummaryCard
            title="Medium Priority"
            count={mediumPriorityCount}
            description="Review alerts"
            icon={
              <AlertOctagon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            }
            bgColor="bg-orange-50 dark:bg-orange-950"
            borderColor="border-orange-400"
            textColor="text-orange-700 dark:text-orange-300"
          />
          <AlertSummaryCard
            title="Low Priority"
            count={lowPriorityCount}
            description="Monitor alerts"
            icon={
              <AlertCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
            }
            bgColor="bg-green-50 dark:bg-green-950"
            borderColor="border-green-400"
            textColor="text-green-700 dark:text-green-300"
          />
        </div>

        {/* Alert List */}
        <div className="border-t pt-3 flex-1 overflow-hidden">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Recent Alerts ({activeAlerts.length})
          </p>
          <div className="h-full overflow-y-auto pr-2">
            <div className="space-y-2">
              {activeAlerts.length > 0 ? (
                activeAlerts.map((alert) => (
                  <AlertNotificationCard
                    key={alert.id}
                    {...alert}
                    onAcknowledge={onAcknowledge}
                    onFalsePositive={onFalsePositive}
                    onViewCamera={onViewCamera}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="h-12 w-12 mx-auto mb-2 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-sm font-medium">No Active Alerts</p>
                  <p className="text-xs text-muted-foreground">
                    All systems operating normally
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
