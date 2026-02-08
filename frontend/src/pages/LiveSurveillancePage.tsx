import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { cameraService } from '@/services/cameraService'
import type { Camera } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Video,
  Search,
  Loader2,
  Camera as CameraIcon,
  MapPin,
  Grid2X2,
  Grid3X3,
  LayoutGrid,
  Maximize2,
  Filter,
  X,
  Zap,
  AlertCircle,
  Play,
  Pause,
  SkipBack,
} from 'lucide-react'

type LayoutType = '1x1' | '2x2' | '3x3' | '4x4'
type SearchMode = 'camera' | 'person'

interface SearchFilters {
  location: string
  cameraName: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
}

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

interface AnimationState {
  currentFrame: number
  isPlaying: boolean
  totalFrames: number
}

// Mock detection results
const mockDetections: PersonDetection[] = [
  {
    id: '1',
    cameraId: 'cam1',
    cameraName: 'Entrance A',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    attributes: { gender: 'Male', upperColor: 'Red', lowerColor: 'Black', upperType: 'Shirt', lowerType: 'Pants', accessoryType: 'Bag', accessoryColor: 'Black' },
    confidence: 0.95,
    frameIndex: 1234,
  },
  {
    id: '2',
    cameraId: 'cam2',
    cameraName: 'Corridor B',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    thumbnail: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    attributes: { gender: 'Female', upperColor: 'Blue', lowerColor: 'White', upperType: 'Jacket', lowerType: 'Skirt', accessoryType: 'Hat', accessoryColor: 'Black' },
    confidence: 0.88,
    frameIndex: 2156,
  },
  {
    id: '3',
    cameraId: 'cam3',
    cameraName: 'Parking Lot',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    thumbnail: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    attributes: { gender: 'Male', upperColor: 'White', lowerColor: 'Blue', upperType: 'Sweater', lowerType: 'Pants', accessoryType: 'Shoes', accessoryColor: 'White' },
    confidence: 0.82,
    frameIndex: 3421,
  },
  {
    id: '4',
    cameraId: 'cam1',
    cameraName: 'Entrance A',
    timestamp: new Date(Date.now() - 1200000).toISOString(),
    thumbnail: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=200&h=200&fit=crop',
    attributes: { gender: 'Female', upperColor: 'Black', lowerColor: 'Black', upperType: 'Shirt', lowerType: 'Pants', accessoryType: 'Bag', accessoryColor: 'Red' },
    confidence: 0.79,
    frameIndex: 4567,
  },
]

// Color palette for quick filters
const colorPalette = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'White', 'Grey', 'Black']
const clothingTypes = {
  top: ['Shirt', 'Jacket', 'Sweater'],
  bottom: ['Shorts', 'Skirt', 'Pants']
}
const accessoryTypes = ['Bag', 'Hat', 'Shoes']

// Helper function to draw detections on canvas with confidence-based colors
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

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Draw background
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Draw gradient effect for demo
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
  gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.05)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Draw title
  ctx.fillStyle = '#9ca3af'
  ctx.font = 'bold 16px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(`${cameraName}`, canvas.width / 2, 30)

  // Draw frame info with FPS indicator
  ctx.fillStyle = '#6b7280'
  ctx.font = '13px Arial'
  ctx.fillText(
    `Frame: ${currentFrame.toString().padStart(3, '0')} | Detections: ${totalDetections} | FPS: ${fps} ${isAnimating ? '● PLAYING' : ''}`,
    canvas.width / 2,
    canvas.height - 20
  )

  // Draw bounding boxes with confidence-based colors
  detections.forEach((detection, idx) => {
    // Base positions
    const basePositions = [
      { x: 0.1, y: 0.15, w: 0.28, h: 0.45 },
      { x: 0.58, y: 0.35, w: 0.26, h: 0.38 },
      { x: 0.35, y: 0.6, w: 0.2, h: 0.35 },
    ]

    const basePos = basePositions[idx % basePositions.length]
    
    // Add animated movement for demo (horizontal bounce)
    const animationAmount = isAnimating ? Math.sin((currentFrame / 10) * Math.PI) * 0.03 : 0
    
    const bbox = {
      x: (basePos.x + animationAmount) * canvas.width,
      y: basePos.y * canvas.height,
      width: basePos.w * canvas.width,
      height: basePos.h * canvas.height,
    }

    // Determine box color based on confidence level
    let boxColor = '#10b981' // Green (high confidence)
    if (detection.confidence > 0.7) {
      boxColor = '#10b981' // Green
    } else if (detection.confidence >= 0.5 && detection.confidence <= 0.7) {
      boxColor = '#eab308' // Yellow (medium)
    } else {
      boxColor = '#ef4444' // Red (low)
    }

    // Draw bounding box with glowing effect when animating
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

    // Draw label background with same color as box
    ctx.fillStyle = boxColor
    const labelWidth = 200
    const labelHeight = 28
    ctx.fillRect(bbox.x, Math.max(0, bbox.y - labelHeight), labelWidth, labelHeight)

    // Draw label text
    ctx.fillStyle = boxColor === '#eab308' ? '#000' : '#fff'
    ctx.font = 'bold 12px Arial'
    ctx.textAlign = 'left'
    const confidence = (detection.confidence * 100).toFixed(0)
    const label = `${detection.attributes.gender} ${confidence}% confidence`
    ctx.fillText(label, bbox.x + 8, Math.max(16, bbox.y - 6))

    // Draw attribute label beneath box
    ctx.fillStyle = '#9ca3af'
    ctx.font = '11px Arial'
    const attributes = []
    if (detection.attributes.upperColor) attributes.push(detection.attributes.upperColor)
    if (detection.attributes.lowerColor) attributes.push(detection.attributes.lowerColor)
    const attrText = attributes.join(' | ')
    if (attrText) {
      ctx.fillText(attrText, bbox.x, bbox.y + bbox.height + 15)
    }

    // Draw corner markers
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

export default function LiveSurveillancePage() {
  const [layout, setLayout] = useState<LayoutType>('2x2')
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null)
  const [searchMode, setSearchMode] = useState<SearchMode>('camera')
  const [showSearchPanel, setShowSearchPanel] = useState(false)
  const [personQuery, setPersonQuery] = useState('')
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7)
  const [detectionResults, setDetectionResults] = useState<PersonDetection[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  
  // Quick filter states
  const [selectedGender, setSelectedGender] = useState<string | null>(null)
  const [selectedTopColor, setSelectedTopColor] = useState<string | null>(null)
  const [selectedBottomColor, setSelectedBottomColor] = useState<string | null>(null)
  const [selectedTopType, setSelectedTopType] = useState<string | null>(null)
  const [selectedBottomType, setSelectedBottomType] = useState<string | null>(null)
  const [selectedAccessoryType, setSelectedAccessoryType] = useState<string | null>(null)
  const [selectedAccessoryColor, setSelectedAccessoryColor] = useState<string | null>(null)
  const [recentlySearched, setRecentlySearched] = useState<Array<{id: string, query: string}>>([])
  
  // Camera search dropdown filter
  const [cameraSearchInput, setCameraSearchInput] = useState('')
  const [locationSearchInput, setLocationSearchInput] = useState('')
  const [showCameraDropdown, setShowCameraDropdown] = useState(false)
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)

  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    cameraName: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: ''
  })

  // Animation state - ONLY for camera grid
  const [animationState, setAnimationState] = useState<Record<string, AnimationState>>({})
  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({})

  // Processing statistics state
  const [processingStats, setProcessingStats] = useState({
    totalDetections: 0,
    framesProcessed: 0,
    currentFps: 20,
    averageConfidence: 0,
  })

  const { data: cameras, isLoading } = useQuery({
    queryKey: ['cameras'],
    queryFn: () => cameraService.listCameras(false),
  })

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

  const filteredCameras = cameras?.filter(camera => {
    if (filters.location && !camera.location?.toLowerCase().includes(filters.location.toLowerCase())) {
      return false
    }
    if (filters.cameraName && !camera.camera_name.toLowerCase().includes(filters.cameraName.toLowerCase())) {
      return false
    }
    return true
  }) || []

  const displayedCameras = filteredCameras.slice(0, getMaxCameras())

  // Initialize animation state ONLY for camera grid (not search results)
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

  // Animation loop - ONLY for camera grid (displayedCameras)
  useEffect(() => {
    const intervals: Record<string, NodeJS.Timeout> = {}

    displayedCameras.forEach((camera) => {
      const cameraId = (camera.camera_id as unknown as string) + '_grid'
      const state = animationState[cameraId]
      if (!state) return

      // Always draw current frame
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

      // If playing, set interval to advance frames
      if (state.isPlaying) {
        intervals[cameraId] = setInterval(() => {
          setAnimationState((prev) => {
            const newState = { ...prev }
            if (newState[cameraId]) {
              newState[cameraId].currentFrame = (newState[cameraId].currentFrame + 1) % newState[cameraId].totalFrames
            }
            return newState
          })

          // Update processing statistics
          setProcessingStats((prev) => {
            const avgConfidence = detectionResults.length > 0
              ? detectionResults.reduce((sum, d) => sum + d.confidence, 0) / detectionResults.length
              : 0
            
            return {
              totalDetections: detectionResults.length,
              framesProcessed: prev.framesProcessed + 1,
              currentFps: 20, // Target FPS
              averageConfidence: avgConfidence,
            }
          })
        }, 50) // 20fps animation for demo
      }
    })

    // Cleanup intervals
    return () => {
      Object.values(intervals).forEach((interval) => clearInterval(interval))
    }
  }, [animationState, displayedCameras, detectionResults])
  
  // Draw grid camera canvases with detections - draw immediately on mount
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
        // Draw empty canvas
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
  
  // Draw search result canvases immediately when they appear (STATIC, no animation)
  useEffect(() => {
    if (!hasSearched || detectionResults.length === 0) return

    detectionResults.forEach((detection) => {
      const cameraId = detection.cameraId as unknown as string
      const canvas = canvasRefs.current[`${cameraId}_search`]
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const camDetections = detectionResults.filter((d) => d.cameraId === cameraId)
      drawDetectionsOnCanvas(ctx, canvas, camDetections, 0, detection.cameraName, camDetections.length, false)
    })
  }, [hasSearched, detectionResults])
  
  
  // Get unique camera names and locations for dropdowns
  const uniqueLocations = Array.from(new Set(cameras?.map(c => c.location).filter(Boolean) || []))
  const uniqueCameraNames = Array.from(new Set(cameras?.map(c => c.camera_name) || []))
  
  // Filter dropdown options based on input
  const filteredLocations = uniqueLocations.filter(loc => 
    loc?.toLowerCase().includes(locationSearchInput.toLowerCase())
  )
  const filteredCameraNames = uniqueCameraNames.filter(name => 
    name.toLowerCase().includes(cameraSearchInput.toLowerCase())
  )

  const clearFilters = () => {
    setFilters({
      location: '',
      cameraName: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: ''
    })
  }

  const handleParseQuery = () => {
    // Simulate NLP parsing and search with quick filters
    let results = mockDetections.filter(d => d.confidence >= confidenceThreshold)
    
    // Apply gender filter
    if (selectedGender) {
      results = results.filter(d => d.attributes.gender === selectedGender)
    }
    
    // Apply top clothing type filter
    if (selectedTopType) {
      results = results.filter(d => d.attributes.upperType === selectedTopType)
    }
    
    // Apply bottom clothing type filter
    if (selectedBottomType) {
      results = results.filter(d => d.attributes.lowerType === selectedBottomType)
    }
    
    // Apply top color filter
    if (selectedTopColor) {
      results = results.filter(d => d.attributes.upperColor === selectedTopColor)
    }
    
    // Apply bottom color filter
    if (selectedBottomColor) {
      results = results.filter(d => d.attributes.lowerColor === selectedBottomColor)
    }

    // Apply accessory filters
    if (selectedAccessoryType) {
      results = results.filter(d => d.attributes.accessoryType === selectedAccessoryType)
    }

    if (selectedAccessoryColor) {
      results = results.filter(d => d.attributes.accessoryColor === selectedAccessoryColor)
    }
    
    // Simple keyword matching for text query if present
    const queryLower = personQuery.toLowerCase()
    if (queryLower) {
      results = results.filter(d => {
        if (queryLower.includes('male')) return d.attributes.gender === 'Male'
        if (queryLower.includes('female')) return d.attributes.gender === 'Female'
        return true
      })
    }

    // Sort results by confidence
    results.sort((a, b) => b.confidence - a.confidence)

    setDetectionResults(results)
    setHasSearched(true)

    // Add to recently searched
    const searchQuery = personQuery || `${selectedGender || ''}${selectedTopType ? ' ' + selectedTopType : ''}${selectedTopColor ? ' ' + selectedTopColor : ''}`
    if (searchQuery.trim()) {
      setRecentlySearched(prev => [
        { id: Date.now().toString(), query: searchQuery.trim() },
        ...prev.filter(item => item.query !== searchQuery.trim()).slice(0, 4)
      ])
    }
  }

  const resetFilters = () => {
    setPersonQuery('')
    setSelectedGender(null)
    setSelectedTopType(null)
    setSelectedBottomType(null)
    setSelectedTopColor(null)
    setSelectedBottomColor(null)
    setSelectedAccessoryType(null)
    setSelectedAccessoryColor(null)
    setDetectionResults([])
    setHasSearched(false)
    setConfidenceThreshold(0.7)
  }

  const applyQuickAttribute = (attribute: string) => {
    setPersonQuery(prevQuery => {
      if (prevQuery.includes(attribute)) {
        return prevQuery.replace(attribute, '').trim()
      }
      return (prevQuery ? prevQuery + ' ' : '') + attribute
    })
  }

  const hasActiveFilters = filters.location || filters.cameraName || filters.startDate || filters.endDate

  // Get detected cameras from search results
  const detectedCameraIds = new Set(detectionResults.map(d => d.cameraId as unknown as string))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Live Surveillance</h1>
          <p className="text-muted-foreground">
            Monitor multiple cameras in real-time and search for persons
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={searchMode === 'camera' && showSearchPanel ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSearchMode('camera')
              setShowSearchPanel(!showSearchPanel && searchMode === 'camera')
              if (searchMode !== 'camera') {
                setShowSearchPanel(true)
              }
            }}
          >
            <Search className="h-4 w-4 mr-2" />
            Cameras
          </Button>
          <Button
            variant={searchMode === 'person' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSearchMode('person')
              setShowSearchPanel(true)
            }}
          >
            <Zap className="h-4 w-4 mr-2" />
            Find Person
          </Button>
        </div>
      </div>

      {/* Camera Search Panel */}
      {showSearchPanel && searchMode === 'camera' && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Search & Filter Cameras
              </CardTitle>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Location Dropdown */}
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Location
                </Label>
                <div className="relative">
                  <Input
                    placeholder="Search location..."
                    value={filters.location}
                    onChange={(e) => {
                      setFilters({ ...filters, location: e.target.value })
                      setLocationSearchInput(e.target.value)
                      setShowLocationDropdown(true)
                    }}
                    onFocus={() => setShowLocationDropdown(true)}
                    className="cursor-pointer h-8 text-xs"
                  />
                  {showLocationDropdown && filteredLocations.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                      {filteredLocations.map((location) => (
                        <div
                          key={location}
                          onClick={() => {
                            setFilters({ ...filters, location: location || '' })
                            setShowLocationDropdown(false)
                          }}
                          className="px-3 py-1 text-xs hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          {location}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Camera Name Dropdown */}
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1">
                  <CameraIcon className="h-3 w-3" />
                  Camera
                </Label>
                <div className="relative">
                  <Input
                    placeholder="Search camera..."
                    value={filters.cameraName}
                    onChange={(e) => {
                      setFilters({ ...filters, cameraName: e.target.value })
                      setCameraSearchInput(e.target.value)
                      setShowCameraDropdown(true)
                    }}
                    onFocus={() => setShowCameraDropdown(true)}
                    className="cursor-pointer h-8 text-xs"
                  />
                  {showCameraDropdown && filteredCameraNames.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                      {filteredCameraNames.map((name) => (
                        <div
                          key={name}
                          onClick={() => {
                            setFilters({ ...filters, cameraName: name })
                            setShowCameraDropdown(false)
                          }}
                          className="px-3 py-1 text-xs hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          {name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-1">
                <Label className="text-xs">Date</Label>
                <div className="flex gap-1">
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="flex-1 h-8 text-xs"
                  />
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className="flex-1 h-8 text-xs"
                  />
                </div>
              </div>

              {/* Time Range */}
              <div className="space-y-1">
                <Label className="text-xs">Time</Label>
                <div className="flex gap-1">
                  <Input
                    type="time"
                    value={filters.startTime}
                    onChange={(e) => setFilters({ ...filters, startTime: e.target.value })}
                    className="flex-1 h-8 text-xs"
                  />
                  <Input
                    type="time"
                    value={filters.endTime}
                    onChange={(e) => setFilters({ ...filters, endTime: e.target.value })}
                    className="flex-1 h-8 text-xs"
                  />
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {displayedCameras.length} of {cameras?.length || 0} cameras
              </p>
              <Button size="sm" className="h-8 text-xs">
                <Search className="h-3 w-3 mr-1" />
                Apply
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video Processing Section - For Camera Grid View */}
      {searchMode !== 'person' && !showSearchPanel && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Video className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Video Processing Control
            </CardTitle>
            <CardDescription>Upload surveillance footage or select a live camera source</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Video Input Section */}
              <div className="space-y-3 col-span-2">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Video Input</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="video/*"
                        className="cursor-pointer h-8 text-xs"
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Or Select Live Camera</Label>
                  <div className="relative">
                    <select
                      className="w-full h-8 rounded border border-input bg-background px-3 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      disabled
                    >
                      <option>Select a camera source...</option>
                      {displayedCameras.map((cam) => (
                        <option key={cam.camera_id}>{cam.camera_name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Processing Controls */}
                <div className="flex gap-2 pt-2">
                  <Button className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700">
                    <Play className="h-3 w-3 mr-1" />
                    Start
                  </Button>
                  <Button variant="outline" className="flex-1 h-8 text-xs">
                    <Pause className="h-3 w-3 mr-1" />
                    Pause
                  </Button>
                  <Button variant="outline" className="flex-1 h-8 text-xs text-red-600">
                    <X className="h-3 w-3 mr-1" />
                    Stop
                  </Button>
                </div>
              </div>

              {/* Processing Statistics Panel */}
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-3 space-y-2">
                <h3 className="text-sm font-semibold mb-3">Processing Statistics</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Detections:</span>
                    <span className="font-bold text-base">{processingStats.totalDetections}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Current FPS:</span>
                    <span className="font-bold text-green-600">{processingStats.currentFps}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Frames Processed:</span>
                    <span className="font-bold">{processingStats.framesProcessed}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Avg Confidence:</span>
                    <span className="font-bold text-blue-600">
                      {(processingStats.averageConfidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Confidence Color Legend */}
                <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
                  <p className="text-xs font-semibold mb-2">Confidence Levels:</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span>High ({'>'}0.7)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                      <span>Medium (0.5-0.7)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span>Low ({'\u003c'}0.5)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Person Search Panel */}
      {showSearchPanel && searchMode === 'person' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          {/* Main Search Panel - Left Side (3 columns) */}
          <Card className="lg:col-span-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    Search Person by Attributes
                  </CardTitle>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="h-7 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Text Query Input */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Search Query</Label>
                <Input
                  placeholder="e.g., male in red jacket, woman with blue pants..."
                  value={personQuery}
                  onChange={(e) => setPersonQuery(e.target.value)}
                  className="bg-white dark:bg-slate-900 h-8 text-xs"
                />
              </div>

              {/* Confidence Threshold - Right under search input */}
              <div className="space-y-1">
                <Label className="text-xs">Confidence: {(confidenceThreshold * 100).toFixed(0)}%</Label>
                <input
                  type="range"
                  min="0.5"
                  max="1"
                  step="0.05"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                  className="w-full h-1"
                />
              </div>

              {/* Row 1: Gender */}
              <div className="space-y-1 pt-1 border-t">
                <Label className="text-xs font-semibold">Gender</Label>
                <div className="flex gap-1">
                  {['Male', 'Female'].map((gender) => (
                    <button
                      key={gender}
                      onClick={() => {
                        setSelectedGender(selectedGender === gender ? null : gender)
                        applyQuickAttribute(gender)
                      }}
                      className={`px-3 py-1 rounded border text-xs font-medium transition-all ${
                        selectedGender === gender
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 dark:border-slate-600 hover:border-blue-400'
                      }`}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 2: Upper Clothing */}
              <div className="space-y-1 pt-1 border-t">
                <Label className="text-xs font-semibold">Upper Clothing</Label>
                <div className="space-y-1">
                  <div className="flex flex-wrap gap-1">
                    {clothingTypes.top.map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setSelectedTopType(selectedTopType === type ? null : type)
                          applyQuickAttribute(type)
                        }}
                        className={`px-2 py-0.5 rounded text-xs font-medium border transition-all ${
                          selectedTopType === type
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'border-gray-300 dark:border-slate-600'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {colorPalette.map((color) => (
                      <button
                        key={`top-${color}`}
                        onClick={() => {
                          setSelectedTopColor(selectedTopColor === color ? null : color)
                          applyQuickAttribute(color)
                        }}
                        className={`w-4 h-4 rounded-full border transition-all ${
                          selectedTopColor === color ? 'ring-2 ring-offset-1 border-black dark:border-white' : 'border-gray-300'
                        }`}
                        style={{
                          backgroundColor: color === 'White' ? '#f5f5f5' : 
                                           color === 'Grey' ? '#999999' :
                                           color === 'Black' ? '#000000' :
                                           color.toLowerCase()
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 3: Lower Clothing */}
              <div className="space-y-1 pt-1 border-t">
                <Label className="text-xs font-semibold">Lower Clothing</Label>
                <div className="space-y-1">
                  <div className="flex flex-wrap gap-1">
                    {clothingTypes.bottom.map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setSelectedBottomType(selectedBottomType === type ? null : type)
                          applyQuickAttribute(type)
                        }}
                        className={`px-2 py-0.5 rounded text-xs font-medium border transition-all ${
                          selectedBottomType === type
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'border-gray-300 dark:border-slate-600'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {colorPalette.map((color) => (
                      <button
                        key={`bottom-${color}`}
                        onClick={() => {
                          setSelectedBottomColor(selectedBottomColor === color ? null : color)
                          applyQuickAttribute(color)
                        }}
                        className={`w-4 h-4 rounded-full border transition-all ${
                          selectedBottomColor === color ? 'ring-2 ring-offset-1 border-black dark:border-white' : 'border-gray-300'
                        }`}
                        style={{
                          backgroundColor: color === 'White' ? '#f5f5f5' : 
                                           color === 'Grey' ? '#999999' :
                                           color === 'Black' ? '#000000' :
                                           color.toLowerCase()
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 4: Accessories */}
              <div className="space-y-1 pt-1 border-t">
                <Label className="text-xs font-semibold">Accessories</Label>
                <div className="space-y-1">
                  <div className="flex flex-wrap gap-1">
                    {accessoryTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setSelectedAccessoryType(selectedAccessoryType === type ? null : type)
                          applyQuickAttribute(type)
                        }}
                        className={`px-2 py-0.5 rounded text-xs font-medium border transition-all ${
                          selectedAccessoryType === type
                            ? 'bg-orange-600 text-white border-orange-600'
                            : 'border-gray-300 dark:border-slate-600'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {colorPalette.map((color) => (
                      <button
                        key={`accessory-${color}`}
                        onClick={() => {
                          setSelectedAccessoryColor(selectedAccessoryColor === color ? null : color)
                          applyQuickAttribute(color)
                        }}
                        className={`w-4 h-4 rounded-full border transition-all ${
                          selectedAccessoryColor === color ? 'ring-2 ring-offset-1 border-black dark:border-white' : 'border-gray-300'
                        }`}
                        style={{
                          backgroundColor: color === 'White' ? '#f5f5f5' : 
                                           color === 'Grey' ? '#999999' :
                                           color === 'Black' ? '#000000' :
                                           color.toLowerCase()
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Search Button */}
              <div className="pt-1">
                <Button onClick={handleParseQuery} className="w-full bg-blue-600 hover:bg-blue-700 h-8 text-xs">
                  <Search className="h-3 w-3 mr-1" />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recently Searched - Right Side (1 column) */}
          <Card className="h-fit bg-gradient-to-b from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-amber-200 dark:border-amber-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs">Recently Searched</CardTitle>
            </CardHeader>
            <CardContent>
              {recentlySearched.length > 0 ? (
                <div className="space-y-1">
                  {recentlySearched.map((search) => (
                    <button
                      key={search.id}
                      onClick={() => {
                        setPersonQuery(search.query)
                        handleParseQuery()
                      }}
                      className="w-full p-1 text-left text-xs rounded border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors"
                    >
                      <p className="font-medium truncate">{search.query}</p>
                      <p className="text-xs text-muted-foreground">Search</p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground text-center py-2">
                  <p>No searches yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results Section - Show if person search was performed */}
      {searchMode === 'person' && hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Search Results - Cameras with Detected Persons</h2>
            <Badge variant="secondary">{detectedCameraIds.size} cameras found</Badge>
          </div>

          {detectedCameraIds.size > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from(detectedCameraIds).map((cameraId) => {
                const camera = cameras?.find(c => (c.camera_id as unknown as string) === cameraId)
                const detections = detectionResults.filter(d => d.cameraId === cameraId)
                
                if (!camera) return null
                
                return (
                  <Card key={cameraId} className="overflow-hidden border-2 border-yellow-400">
                    {/* Camera Feed Canvas - STATIC, no animation */}
                    <div className="relative aspect-video bg-gray-900 overflow-hidden">
                      <canvas
                        ref={(el) => {
                          if (el) canvasRefs.current[`${cameraId}_search`] = el
                        }}
                        width={800}
                        height={450}
                        className="w-full h-full"
                      />
                    </div>

                    {/* Detections Info */}
                    <CardContent className="p-3 space-y-2">
                      <div className="font-semibold text-xs">Detected: {detections.length}</div>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {detections.map((detection) => (
                          <div key={detection.id} className="bg-muted p-1.5 rounded text-xs space-y-0.5">
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1">
                                <div className="w-8 h-8 rounded bg-gray-300 text-gray-600 flex items-center justify-center font-bold text-xs">
                                  {(detection.confidence * 100).toFixed(0)}%
                                </div>
                                <span className="font-medium truncate">{detection.attributes.gender}</span>
                              </div>
                            </div>
                            <div className="flex gap-1 flex-wrap">
                              {detection.attributes.upperColor && (
                                <Badge variant="secondary" className="text-xs py-0">{detection.attributes.upperType} {detection.attributes.upperColor}</Badge>
                              )}
                              {detection.attributes.lowerColor && (
                                <Badge variant="secondary" className="text-xs py-0">{detection.attributes.lowerType} {detection.attributes.lowerColor}</Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(detection.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="p-8">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-medium mb-1">No Results Found</h3>
                <p className="text-muted-foreground">No cameras matched your search criteria. Try adjusting your filters.</p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Camera Grid - Show when not in person search results view or as secondary view */}
      {searchMode !== 'person' || (searchMode === 'person' && !hasSearched) ? (
        <>
          {/* Layout Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Layout:</span>
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <Button
                  variant={layout === '1x1' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setLayout('1x1')}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant={layout === '2x2' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setLayout('2x2')}
                >
                  <Grid2X2 className="h-4 w-4" />
                </Button>
                <Button
                  variant={layout === '3x3' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setLayout('3x3')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={layout === '4x4' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setLayout('4x4')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Video className="h-3 w-3" />
              {displayedCameras.length} Active Feeds
            </Badge>
          </div>

          {/* Camera Grid */}
          {displayedCameras.length > 0 ? (
            <div className={`grid ${getGridCols()} gap-4`}>
              {displayedCameras.map((camera) => {
                const isDetected = detectedCameraIds.has(camera.camera_id as unknown as string)
                const cameraDetections = detectionResults.filter(d => d.cameraId === (camera.camera_id as unknown as string))
                
                return (
                  <Card
                    key={camera.camera_id}
                    className={`overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-primary ${
                      selectedCamera?.camera_id === camera.camera_id ? 'ring-4 ring-yellow-400 border-yellow-400' : ''
                    } ${isDetected ? 'ring-4 ring-yellow-300 border-yellow-300' : ''}`}
                    onClick={() => setSelectedCamera(camera)}
                  >
                    {/* Camera Feed Canvas */}
                    <div className="relative aspect-video bg-gray-900 overflow-hidden">
                      <canvas
                        ref={(el) => {
                          if (el) canvasRefs.current[(camera.camera_id as unknown as string) + '_grid'] = el
                        }}
                        width={800}
                        height={450}
                        className="w-full h-full"
                      />

                      {/* Static gray background when no detection */}
                      {!isDetected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-xs">
                          <div className="text-center text-white/60">
                            <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Standby</p>
                          </div>
                        </div>
                      )}

                      {/* Yellow highlight if detected */}
                      {isDetected && (
                        <div className="absolute inset-0 border-4 border-yellow-400 opacity-50 pointer-events-none" />
                      )}

                      {/* Animated detection indicator */}
                      {isDetected && animationState[(camera.camera_id as unknown as string) + '_grid']?.isPlaying && (
                        <div className="absolute top-3 right-3">
                          <div className="flex items-center gap-1 px-2 py-1 bg-red-600/80 rounded">
                            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                            <span className="text-xs text-white font-medium">LIVE</span>
                          </div>
                        </div>
                      )}

                      {/* Control Buttons Overlay - Only for detected cameras */}
                      {isDetected && (
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              className="h-8 text-xs"
                              onClick={(e) => {
                                e.stopPropagation()
                                const gridId = (camera.camera_id as unknown as string) + '_grid'
                                const currentState = animationState[gridId]
                                if (currentState) {
                                  setAnimationState((prev) => ({
                                    ...prev,
                                    [gridId]: {
                                      ...currentState,
                                      isPlaying: !currentState.isPlaying,
                                    },
                                  }))
                                }
                              }}
                            >
                              {animationState[(camera.camera_id as unknown as string) + '_grid']?.isPlaying ? (
                                <>
                                  <Pause className="h-3 w-3 mr-1" />
                                  Pause
                                </>
                              ) : (
                                <>
                                  <Play className="h-3 w-3 mr-1" />
                                  Play
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs"
                              onClick={(e) => {
                                e.stopPropagation()
                                const gridId = (camera.camera_id as unknown as string) + '_grid'
                                const currentState = animationState[gridId]
                                if (currentState) {
                                  setAnimationState((prev) => ({
                                    ...prev,
                                    [gridId]: {
                                      ...currentState,
                                      currentFrame: 0,
                                      isPlaying: false,
                                    },
                                  }))
                                }
                              }}
                            >
                              <SkipBack className="h-3 w-3 mr-1" />
                              Reset
                            </Button>
                          </div>

                          {/* Frame Counter */}
                          <div className="text-xs text-white bg-black/50 px-2 py-1 rounded">
                            Frame: {animationState[(camera.camera_id as unknown as string) + '_grid']?.currentFrame || 0} /{' '}
                            {animationState[(camera.camera_id as unknown as string) + '_grid']?.totalFrames || 120}
                          </div>
                        </div>
                      )}

                      {/* Camera Info Overlay */}
                      <div className="absolute top-2 left-2 right-2 flex items-start justify-between pointer-events-none">
                        <div className="bg-black/60 rounded px-2 py-1">
                          <p className="text-white text-xs font-medium">{camera.camera_name}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {isDetected ? 'DETECTED' : 'IDLE'}
                        </Badge>
                      </div>

                      {/* Detection count if detected */}
                      {isDetected && (
                        <div className="absolute top-2 right-12 bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold pointer-events-none">
                          {cameraDetections.length} detected
                        </div>
                      )}

                      {/* Bottom Info */}
                      <div className="absolute bottom-2 left-2 right-2 pointer-events-none">
                        <div className="bg-black/60 rounded px-2 py-1 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-white/80 text-xs">
                            <MapPin className="h-3 w-3" />
                            <span>{camera.location || 'Unknown'}</span>
                          </div>
                          <span className="text-white/60 text-xs">
                            {camera.resolution} @ {camera.fps}fps
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="p-12">
              <div className="text-center">
                <CameraIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Cameras Found</h3>
                <p className="text-muted-foreground">
                  {hasActiveFilters
                    ? 'No cameras match your search criteria. Try adjusting the filters.'
                    : 'No active cameras are available. Contact your administrator.'}
                </p>
              </div>
            </Card>
          )}

          {/* Selected Camera Details */}
          {selectedCamera && (
            <Card className="border-2 border-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CameraIcon className="h-5 w-5" />
                  {selectedCamera.camera_name}
                </CardTitle>
                <CardDescription>{selectedCamera.location || 'No location specified'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Resolution</Label>
                    <p className="font-medium">{selectedCamera.resolution || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Frame Rate</Label>
                    <p className="font-medium">{selectedCamera.fps || 0} FPS</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <Badge variant={selectedCamera.is_active ? 'success' : 'secondary'}>
                      {selectedCamera.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Mask Status</Label>
                    <Badge variant={selectedCamera.mask_file_path ? 'success' : 'outline'}>
                      {selectedCamera.mask_file_path ? 'Configured' : 'Not Set'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : null}
    </div>
  )
}
