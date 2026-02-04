import { useState } from 'react'
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
  Calendar,
  Clock,
  Filter,
  X
} from 'lucide-react'

type LayoutType = '1x1' | '2x2' | '3x3' | '4x4'

interface SearchFilters {
  location: string
  cameraName: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
}

export default function LiveSurveillancePage() {
  const [layout, setLayout] = useState<LayoutType>('2x2')
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    cameraName: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: ''
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

  const hasActiveFilters = filters.location || filters.cameraName || filters.startDate || filters.endDate

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
            Monitor multiple cameras in real-time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showSearch ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      {/* Search Panel */}
      {showSearch && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Search & Filter
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Location
                </Label>
                <Input
                  placeholder="Search by location..."
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <CameraIcon className="h-3 w-3" />
                  Camera Name
                </Label>
                <Input
                  placeholder="Search by camera name..."
                  value={filters.cameraName}
                  onChange={(e) => setFilters({ ...filters, cameraName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Date Range
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="flex-1"
                  />
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Time Range
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="time"
                    value={filters.startTime}
                    onChange={(e) => setFilters({ ...filters, startTime: e.target.value })}
                    className="flex-1"
                  />
                  <Input
                    type="time"
                    value={filters.endTime}
                    onChange={(e) => setFilters({ ...filters, endTime: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {displayedCameras.length} of {cameras?.length || 0} cameras
              </p>
              <Button size="sm">
                <Search className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
          {displayedCameras.map((camera) => (
            <Card
              key={camera.camera_id}
              className={`overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-primary ${
                selectedCamera?.camera_id === camera.camera_id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedCamera(camera)}
            >
              {/* Camera Feed Placeholder */}
              <div className="relative aspect-video bg-gray-900">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white/60">
                    <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Live Feed</p>
                  </div>
                </div>
                {/* Camera Info Overlay */}
                <div className="absolute top-2 left-2 right-2 flex items-start justify-between">
                  <div className="bg-black/60 rounded px-2 py-1">
                    <p className="text-white text-xs font-medium">{camera.camera_name}</p>
                  </div>
                  <Badge variant="success" className="text-xs">
                    LIVE
                  </Badge>
                </div>
                {/* Bottom Info */}
                <div className="absolute bottom-2 left-2 right-2">
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
          ))}
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
        <Card>
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
    </div>
  )
}
