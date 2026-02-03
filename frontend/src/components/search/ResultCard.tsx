import { SearchResultItem } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDuration, formatConfidence, getConfidenceClass, getColorClass, capitalize } from '@/utils/formatters'
import { Clock, User, Image } from 'lucide-react'

interface ResultCardProps {
  result: SearchResultItem
  onClick?: () => void
}

export default function ResultCard({ result, onClick }: ResultCardProps) {
  const imageUrl = result.person_crop_path
    ? `/uploads/crops/${result.video_id}/${result.person_crop_path.split('/').pop()}`
    : null

  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="aspect-[3/4] bg-muted relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Detection ${result.detection_id}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Image className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}

        {/* Confidence Badge */}
        <Badge
          className={`absolute top-2 right-2 ${getConfidenceClass(result.aggregate_confidence)}`}
        >
          {formatConfidence(result.aggregate_confidence)}
        </Badge>
      </div>

      <CardContent className="p-3">
        {/* Attributes */}
        <div className="flex flex-wrap gap-1 mb-2">
          {result.gender && (
            <Badge variant="secondary" className="text-xs">
              <User className="h-3 w-3 mr-1" />
              {capitalize(result.gender)}
            </Badge>
          )}
          {result.upper_color && (
            <Badge variant="outline" className="text-xs">
              <span
                className={`w-2 h-2 rounded-full mr-1 ${getColorClass(result.upper_color)}`}
              />
              {capitalize(result.upper_color)} Top
            </Badge>
          )}
          {result.lower_color && (
            <Badge variant="outline" className="text-xs">
              <span
                className={`w-2 h-2 rounded-full mr-1 ${getColorClass(result.lower_color)}`}
              />
              {capitalize(result.lower_color)} Bottom
            </Badge>
          )}
        </div>

        {/* Video Info */}
        <div className="text-xs text-muted-foreground">
          <div className="flex items-center gap-1 truncate">
            <Clock className="h-3 w-3" />
            {formatDuration(result.timestamp_in_video)}
          </div>
          <div className="truncate" title={result.video_filename}>
            {result.video_filename}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
