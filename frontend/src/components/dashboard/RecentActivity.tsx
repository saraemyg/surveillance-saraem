import { RecentActivity } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateTime, formatDuration, getStatusClass } from '@/utils/formatters'
import { Activity, Film } from 'lucide-react'

interface RecentActivityProps {
  activities: RecentActivity[]
}

export default function RecentActivityList({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No recent activity
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.video_id}
              className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
            >
              <div className="p-2 bg-background rounded-md">
                <Film className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{activity.filename}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{activity.detection_count} detections</span>
                  <span>.</span>
                  <span>{formatDuration(activity.duration)}</span>
                </div>
              </div>
              <div className="text-right">
                <Badge className={getStatusClass(activity.status)}>
                  {activity.status}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDateTime(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
