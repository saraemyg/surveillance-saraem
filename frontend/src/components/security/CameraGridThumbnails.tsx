import { Card } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import type { Camera } from '@/types'

interface CameraGridThumbnailsProps {
  cameras: Camera[]
  selectedCameraId?: string | number
  onCameraClick: (camera: Camera) => void
  alertCameraIds?: Set<string | number>
}

export default function CameraGridThumbnails({
  cameras,
  selectedCameraId,
  onCameraClick,
  alertCameraIds = new Set(),
}: CameraGridThumbnailsProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Available Cameras</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
        {cameras.map((camera) => {
          const isSelected = selectedCameraId === camera.camera_id
          const hasAlert = alertCameraIds.has(camera.camera_id)

          return (
            <button
              key={camera.camera_id}
              onClick={() => onCameraClick(camera)}
              className={`relative group transition-all ${
                isSelected
                  ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-900'
                  : 'hover:ring-1 hover:ring-blue-300'
              }`}
            >
              <Card
                className={`aspect-square flex flex-col items-center justify-center p-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-950 border-blue-400'
                    : hasAlert
                      ? 'bg-yellow-50 dark:bg-yellow-950 border-yellow-300'
                      : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                <div className="space-y-1 text-center w-full">
                  {hasAlert && (
                    <div className="flex justify-center mb-1">
                      <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400 animate-pulse" />
                    </div>
                  )}
                  <p className="text-xs font-semibold truncate max-w-[60px]">
                    {camera.camera_name}
                  </p>
                  {camera.location && (
                    <p className="text-xs text-muted-foreground truncate max-w-[60px]">
                      {camera.location}
                    </p>
                  )}
                </div>
              </Card>

              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-slate-900 dark:bg-slate-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                  {camera.camera_name}
                  {hasAlert && ' (Alert)'}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
