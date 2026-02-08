import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { cameraService } from '@/services/cameraService'
import type { Camera } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import AlertPanel from '@/components/security/AlertPanel'
import CameraGridThumbnails from '@/components/security/CameraGridThumbnails'
import {
  Video,
  Loader2,
  Camera as CameraIcon,
  Grid2X2,
  Grid3X3,
  LayoutGrid,
  Maximize2,
  AlertCircle,
} from 'lucide-react'

type LayoutType = '1x1' | '2x2' | '3x3' | '4x4'
type BehaviorType = 'RUN' | 'BEND' | 'STAND' | 'WALK' | 'LAY' | 'SIT' | 'FIGHT'
type PriorityType = 'HIGH' | 'MEDIUM' | 'LOW' | 'PENDING'

interface PersonDetection {
  id: string
  cameraId: string
  cameraName: string
  timestamp: string
  thumbnail: string
  attributes: {
    gender?: string
    upperColor?: string
    lowerColor?: string
    upperType?: string
    lowerType?: string
    accessoryType?: string
    accessoryColor?: string
  }
  confidence: number
  frameIndex: number
}

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

interface AnimationState {
  currentFrame: number
  isPlaying: boolean
  totalFrames: number
}

// Mock alerts
const mockAlerts: Alert[] = [
  {
    id: '1',
    behavior: 'RUN',
    cameraId: 'cam1',
    cameraName: 'Entrance A',
    confidence: 0.95,
    priority: 'HIGH',
    timestamp: '5m ago',
    acknowledged: false,
    falsePositive: false,
  },
  {
    id: '2',
    behavior: 'BEND',
    cameraId: 'cam2',
    cameraName: 'Corridor B',
    confidence: 0.82,
    priority: 'MEDIUM',
    timestamp: '12m ago',
    acknowledged: false,
    falsePositive: false,
  },
  {
    id: '3',
    behavior: 'FIGHT',
    cameraId: 'cam1',
    cameraName: 'Entrance A',
    confidence: 0.91,
    priority: 'HIGH',
    timestamp: '3m ago',
    acknowledged: false,
    falsePositive: false,
  },
]

const drawDetectionsOnCanvas = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  detections: PersonDetection[],
  currentFrame: number,
  cameraName: string,
  totalDetections: number,
  isAnimating: boolean = false,
  fps: number = 20
) => {
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
  gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.05)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#9ca3af'
  ctx.font = 'bold 16px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(`${cameraName}`, canvas.width / 2, 30)

  ctx.fillStyle = '#6b7280'
  ctx.font = '13px Arial'
  ctx.fillText(
    `Frame: ${currentFrame.toString().padStart(3, '0')} | Detections: ${totalDetections} | FPS: ${fps} ${isAnimating ? '● PLAYING' : ''}`,
    canvas.width / 2,
    canvas.height - 20
  )

  detections.forEach((detection, idx) => {
    const basePositions = [
      { x: 0.1, y: 0.15, w: 0.28, h: 0.45 },
      { x: 0.58, y: 0.35, w: 0.26, h: 0.38 },
      { x: 0.35, y: 0.6, w: 0.2, h: 0.35 },
    ]

    const basePos = basePositions[idx % basePositions.length]
    const animationAmount = isAnimating ? Math.sin((currentFrame / 10) * Math.PI) * 0.03 : 0

    const bbox = {
      x: (basePos.x + animationAmount) * canvas.width,
      y: basePos.y * canvas.height,
      width: basePos.w * canvas.width,
      height: basePos.h * canvas.height,
    }

    let boxColor = '#10b981'
    if (detection.confidence > 0.7) {
      boxColor = '#10b981'
    } else if (detection.confidence >= 0.5 && detection.confidence <= 0.7) {
      boxColor = '#eab308'
    } else {
      boxColor = '#ef4444'
    }

    if (isAnimating) {
      ctx.shadowColor = boxColor
      ctx.shadowBlur = 10
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
    }

    ctx.strokeStyle = boxColor
    ctx.lineWidth = 3
    ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height)

    ctx.shadowColor = 'transparent'

    ctx.fillStyle = boxColor
    const labelWidth = 200
    const labelHeight = 28
    ctx.fillRect(bbox.x, Math.max(0, bbox.y - labelHeight), labelWidth, labelHeight)

    ctx.fillStyle = boxColor === '#eab308' ? '#000' : '#fff'
    ctx.font = 'bold 12px Arial'
    ctx.textAlign = 'left'
    const confidence = (detection.confidence * 100).toFixed(0)
    const label = `${detection.attributes.gender} ${confidence}% confidence`
    ctx.fillText(label, bbox.x + 8, Math.max(16, bbox.y - 6))

    ctx.fillStyle = '#9ca3af'
    ctx.font = '11px Arial'
    const attributes = []
    if (detection.attributes.upperColor) attributes.push(detection.attributes.upperColor)
    if (detection.attributes.lowerColor) attributes.push(detection.attributes.lowerColor)
    const attrText = attributes.join(' | ')
    if (attrText) {
      ctx.fillText(attrText, bbox.x, bbox.y + bbox.height + 15)
    }

    ctx.fillStyle = boxColor
    const cornerSize = 6
    ctx.fillRect(bbox.x, bbox.y, cornerSize, cornerSize)
    ctx.fillRect(bbox.x + bbox.width - cornerSize, bbox.y, cornerSize, cornerSize)
    ctx.fillRect(bbox.x, bbox.y + bbox.height - cornerSize, cornerSize, cornerSize)
    ctx.fillRect(
      bbox.x + bbox.width - cornerSize,
      bbox.y + bbox.height - cornerSize,
      cornerSize,
      cornerSize
    )
  })
}

export default function SecurityFeed() {
  const [layout, setLayout] = useState<LayoutType>('2x2')
  const [mainCamera, setMainCamera] = useState<Camera | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts)
  const [detectionResults] = useState<PersonDetection[]>([])

  const [animationState, setAnimationState] = useState<Record<string, AnimationState>>({})
  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({})

  const { data: cameras, isLoading } = useQuery({
    queryKey: ['cameras'],
    queryFn: () => cameraService.listCameras(false),
  })

  // Set initial main camera
  useEffect(() => {
    if (!mainCamera && cameras && cameras.length > 0) {
      setMainCamera(cameras[0])
    }
  }, [cameras, mainCamera])

  const getGridCols = () => {
    switch (layout) {
      case '1x1': return 'grid-cols-1'
      case '2x2': return 'grid-cols-2'
      case '3x3': return 'grid-cols-3'
      case '4x4': return 'grid-cols-4'
      default: return 'grid-cols-2'
    }
  }

  const getMaxCameras = () => {
    switch (layout) {
      case '1x1': return 1
      case '2x2': return 4
      case '3x3': return 9
      case '4x4': return 16
      default: return 4
    }
  }

  const filteredCameras = cameras || []
  const displayedCameras = filteredCameras.slice(0, getMaxCameras())

  useEffect(() => {
    if (displayedCameras.length === 0) return
    
    const newAnimationState: Record<string, AnimationState> = {}
    displayedCameras.forEach((camera) => {
      const cameraId = (camera.camera_id as unknown as string) + '_grid'
      if (!animationState[cameraId]) {
        newAnimationState[cameraId] = {
          currentFrame: 0,
          isPlaying: false,
          totalFrames: 120,
        }
      }
    })
    
    if (Object.keys(newAnimationState).length > 0) {
      setAnimationState((prev) => ({ ...prev, ...newAnimationState }))
    }
  }, [displayedCameras, animationState])

  useEffect(() => {
    const intervals: Record<string, NodeJS.Timeout> = {}

    displayedCameras.forEach((camera) => {
      const cameraId = (camera.camera_id as unknown as string) + '_grid'
      const state = animationState[cameraId]
      if (!state) return

      const camDetections = detectionResults.filter((d) => d.cameraId as unknown as string === (camera.camera_id as unknown as string))
      if (camDetections.length > 0) {
        const canvas = canvasRefs.current[cameraId]
        if (canvas) {
          const ctx = canvas.getContext('2d')
          if (ctx) {
            drawDetectionsOnCanvas(ctx, canvas, camDetections, state.currentFrame, camera.camera_name, camDetections.length, state.isPlaying, 20)
          }
        }
      }

      if (state.isPlaying) {
        intervals[cameraId] = setInterval(() => {
          setAnimationState((prev) => {
            const newState = { ...prev }
            if (newState[cameraId]) {
              newState[cameraId].currentFrame = (newState[cameraId].currentFrame + 1) % newState[cameraId].totalFrames
            }
            return newState
          })
        }, 50)
      }
    })

    return () => {
      Object.values(intervals).forEach((interval) => clearInterval(interval))
    }
  }, [animationState, displayedCameras, detectionResults])
  
  useEffect(() => {
    displayedCameras.forEach((camera) => {
      const cameraId = (camera.camera_id as unknown as string) + '_grid'
      const canvas = canvasRefs.current[cameraId]
      if (!canvas) {
        return
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const camDetections = detectionResults.filter((d) => d.cameraId as unknown as string === (camera.camera_id as unknown as string))
      
      if (camDetections.length > 0) {
        drawDetectionsOnCanvas(ctx, canvas, camDetections, 0, camera.camera_name, camDetections.length, false)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = '#1f2937'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = '#9ca3af'
        ctx.font = 'bold 14px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(camera.camera_name, canvas.width / 2, 25)
        ctx.fillStyle = '#6b7280'
        ctx.font = '12px sans-serif'
        ctx.fillText('No detections', canvas.width / 2, canvas.height / 2)
      }
    })
  }, [displayedCameras, detectionResults])

  const handleMainCameraChange = (camera: Camera) => {
    setMainCamera(camera)
  }

  const handleAcknowledgeAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, acknowledged: true } : alert
      )
    )
  }

  const handleFalsePositiveAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, falsePositive: true } : alert
      )
    )
  }

  const handleViewCameraFromAlert = (cameraId: string) => {
    const camera = cameras?.find((c) => (c.camera_id as unknown as string) === cameraId)
    if (camera) {
      handleMainCameraChange(camera)
    }
  }

  const detectedCameraIds = new Set(detectionResults.map(d => d.cameraId as unknown as string))
  const alertCameraIds = new Set(alerts.filter(a => !a.acknowledged && !a.falsePositive).map(a => a.cameraId as unknown as string))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Live Surveillance</h1>
          <p className="text-muted-foreground">
            Monitor multiple cameras in real-time with live alerts
          </p>
        </div>
      </div>

      {/* Main Content - Two Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[600px]">
        {/* Left Panel - Camera Feed & Grid (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Main Camera Feed */}
          {mainCamera && (
            <Card className="border-2 border-blue-500 overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CameraIcon className="h-5 w-5" />
                    {mainCamera.camera_name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{mainCamera.location}</Badge>
                    <Badge className="bg-green-500">LIVE</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-black rounded-lg overflow-hidden">
                  <canvas
                    ref={(el) => {
                      if (el) canvasRefs.current[`main_${mainCamera.camera_id}`] = el
                    }}
                    width={800}
                    height={400}
                    className="w-full aspect-video bg-black"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Layout Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Layout:</span>
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                {(['1x1', '2x2', '3x3', '4x4'] as LayoutType[]).map((l) => (
                  <Button
                    key={l}
                    size="sm"
                    variant={layout === l ? 'default' : 'ghost'}
                    onClick={() => setLayout(l)}
                    className="h-8 w-8 p-0"
                  >
                    {l === '1x1' && <Maximize2 className="h-4 w-4" />}
                    {l === '2x2' && <Grid2X2 className="h-4 w-4" />}
                    {l === '3x3' && <Grid3X3 className="h-4 w-4" />}
                    {l === '4x4' && <LayoutGrid className="h-4 w-4" />}
                  </Button>
                ))}
              </div>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Video className="h-3 w-3" />
              {displayedCameras.length} Active Feeds
            </Badge>
          </div>

          {/* Camera Grid */}
          {displayedCameras.length > 0 && (
            <div className={`grid ${getGridCols()} gap-3`}>
              {displayedCameras.map((camera) => {
                const isDetected = detectedCameraIds.has(camera.camera_id as unknown as string)
                
                return (
                  <Card
                    key={camera.camera_id}
                    className={`overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-primary ${
                      mainCamera?.camera_id === camera.camera_id ? 'ring-4 ring-blue-400 border-blue-400' : ''
                    } ${isDetected ? 'ring-4 ring-yellow-300 border-yellow-300' : ''}`}
                    onClick={() => handleMainCameraChange(camera)}
                  >
                    <CardHeader className="pb-1">
                      <CardTitle className="text-xs flex items-center justify-between">
                        <span>{camera.camera_name}</span>
                        {isDetected && (
                          <AlertCircle className="h-3 w-3 text-orange-500 animate-pulse" />
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                      <canvas
                        ref={(el) => {
                          if (el) canvasRefs.current[(camera.camera_id as unknown as string) + '_grid'] = el
                        }}
                        width={400}
                        height={300}
                        className="w-full bg-black rounded"
                      />
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Camera Thumbnails */}
          {cameras && cameras.length > 0 && (
            <CameraGridThumbnails
              cameras={cameras}
              selectedCameraId={mainCamera?.camera_id}
              onCameraClick={handleMainCameraChange}
              alertCameraIds={alertCameraIds}
            />
          )}
        </div>

        {/* Right Panel - Alert Notifications (1/3) */}
        <div className="lg:col-span-1 h-fit lg:sticky lg:top-4">
          <AlertPanel
            alerts={alerts}
            onAcknowledge={handleAcknowledgeAlert}
            onFalsePositive={handleFalsePositiveAlert}
            onViewCamera={handleViewCameraFromAlert}
          />
        </div>
      </div>
    </div>
  )
}
