import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { videoService } from '@/services'
import { Video, VideoProcessingStatus as ProcessingStatusType } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDuration, formatDateTime, getStatusClass } from '@/utils/formatters'
import { PROCESSING_STATUS_INTERVAL } from '@/utils/constants'
import { Play, Trash2, Clock, Film, Users } from 'lucide-react'

interface VideoCardProps {
  video: Video
  onProcess: (videoId: number) => void
  onDelete: (videoId: number) => void
}

function VideoCard({ video, onProcess, onDelete }: VideoCardProps) {
  const [status, setStatus] = useState<ProcessingStatusType | null>(null)

  // Poll for status updates when processing
  const { data: statusData } = useQuery({
    queryKey: ['videoStatus', video.video_id],
    queryFn: () => videoService.getProcessingStatus(video.video_id),
    enabled: video.processing_status === 'processing',
    refetchInterval: PROCESSING_STATUS_INTERVAL,
  })

  useEffect(() => {
    if (statusData) {
      setStatus(statusData)
    }
  }, [statusData])

  const isProcessing = video.processing_status === 'processing'
  const isCompleted = video.processing_status === 'completed'
  const canProcess = video.processing_status === 'uploaded'

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Film className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium truncate">{video.filename}</h3>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDuration(video.duration_seconds)}
              </div>
              <div>{video.resolution || '-'}</div>
              <div>{video.fps ? `${video.fps.toFixed(1)} FPS` : '-'}</div>
            </div>

            {isProcessing && status && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Processing...</span>
                  <span>{status.progress.toFixed(1)}%</span>
                </div>
                <Progress value={status.progress} />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {status.detections_count} detections found
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-3">
              <Badge className={getStatusClass(video.processing_status)}>
                {video.processing_status}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDateTime(video.upload_timestamp)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {canProcess && (
              <Button
                size="sm"
                onClick={() => onProcess(video.video_id)}
              >
                <Play className="h-4 w-4 mr-1" />
                Process
              </Button>
            )}
            {!isProcessing && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(video.video_id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ProcessingStatusProps {
  videos: Video[]
  onProcess: (videoId: number) => void
  onDelete: (videoId: number) => void
}

export default function ProcessingStatus({
  videos,
  onProcess,
  onDelete,
}: ProcessingStatusProps) {
  if (videos.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Film className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No videos uploaded yet</p>
          <p className="text-sm">Upload a video to get started</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {videos.map((video) => (
        <VideoCard
          key={video.video_id}
          video={video}
          onProcess={onProcess}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
