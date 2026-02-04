import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { videoService } from '@/services'
import VideoUploader from '@/components/video/VideoUploader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from '@/components/ui/use-toast'
import { formatDuration } from '@/utils/formatters'
import {
  Search,
  Loader2,
  Video as VideoIcon,
  Upload,
  Play,
  Trash2,
  Filter,
  Calendar,
  X,
  FileVideo,
  Clock,
  Eye,
  CheckCircle
} from 'lucide-react'

interface SearchFilters {
  filename: string
  status: string
  startDate: string
  endDate: string
}

export default function VideoArchivePage() {
  const queryClient = useQueryClient()
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    filename: '',
    status: '',
    startDate: '',
    endDate: ''
  })

  const { data: videos, isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: () => videoService.listVideos({ limit: 100 }),
  })

  const processMutation = useMutation({
    mutationFn: videoService.processVideo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] })
      toast({
        title: 'Processing Started',
        description: 'Video processing has been initiated.',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: videoService.deleteVideo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] })
      toast({
        title: 'Video Deleted',
        description: 'The video has been removed from the archive.',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const handleUploadComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['videos'] })
  }

  const filteredVideos = videos?.filter(video => {
    if (filters.filename && !video.filename.toLowerCase().includes(filters.filename.toLowerCase())) {
      return false
    }
    if (filters.status && video.processing_status !== filters.status) {
      return false
    }
    if (filters.startDate) {
      const videoDate = new Date(video.upload_timestamp)
      const startDate = new Date(filters.startDate)
      if (videoDate < startDate) return false
    }
    if (filters.endDate) {
      const videoDate = new Date(video.upload_timestamp)
      const endDate = new Date(filters.endDate)
      endDate.setHours(23, 59, 59)
      if (videoDate > endDate) return false
    }
    return true
  }) || []

  const clearFilters = () => {
    setFilters({
      filename: '',
      status: '',
      startDate: '',
      endDate: ''
    })
  }

  const hasActiveFilters = filters.filename || filters.status || filters.startDate || filters.endDate

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success" className="gap-1"><CheckCircle className="h-3 w-3" />Completed</Badge>
      case 'processing':
        return <Badge variant="warning" className="gap-1"><Loader2 className="h-3 w-3 animate-spin" />Processing</Badge>
      case 'uploaded':
        return <Badge variant="secondary" className="gap-1"><Upload className="h-3 w-3" />Uploaded</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Statistics
  const stats = {
    total: videos?.length || 0,
    completed: videos?.filter(v => v.processing_status === 'completed').length || 0,
    processing: videos?.filter(v => v.processing_status === 'processing').length || 0,
    uploaded: videos?.filter(v => v.processing_status === 'uploaded').length || 0
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Video Archive</h1>
          <p className="text-muted-foreground">
            Search, upload, and process surveillance videos
          </p>
        </div>
        <Button
          variant={showFilters ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileVideo className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Videos</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Loader2 className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.processing}</p>
              <p className="text-xs text-muted-foreground">Processing</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Upload className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.uploaded}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search Panel */}
      {showFilters && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Search Archive
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <FileVideo className="h-3 w-3" />
                  Filename
                </Label>
                <Input
                  placeholder="Search by filename..."
                  value={filters.filename}
                  onChange={(e) => setFilters({ ...filters, filename: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  Status
                </Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="">All Status</option>
                  <option value="uploaded">Uploaded</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  From Date
                </Label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  To Date
                </Label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Found {filteredVideos.length} of {videos?.length || 0} videos
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Video
          </CardTitle>
          <CardDescription>
            Upload surveillance videos for AI processing and analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VideoUploader onUploadComplete={handleUploadComplete} />
        </CardContent>
      </Card>

      {/* Video List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <VideoIcon className="h-5 w-5" />
            Video Archive
          </CardTitle>
          <CardDescription>
            All uploaded and processed surveillance videos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredVideos.length > 0 ? (
            <div className="space-y-3">
              {filteredVideos.map((video) => (
                <div
                  key={video.video_id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <VideoIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" title={video.filename}>
                        {video.filename}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(video.duration_seconds)}
                        </span>
                        <span>{video.resolution}</span>
                        <span>{video.fps?.toFixed(0) || 0} FPS</span>
                        <span>{video.total_frames || 0} frames</span>
                      </div>
                      {video.processing_status === 'processing' && (
                        <div className="mt-2 w-full max-w-xs">
                          <Progress value={50} className="h-1" />
                          <p className="text-xs text-muted-foreground mt-1">
                            Processing...
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    {getStatusBadge(video.processing_status)}
                    <div className="flex items-center gap-1">
                      {video.processing_status === 'uploaded' && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => processMutation.mutate(video.video_id)}
                          disabled={processMutation.isPending}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Process
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => deleteMutation.mutate(video.video_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <VideoIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Videos Found</h3>
              <p className="text-muted-foreground">
                {hasActiveFilters
                  ? 'No videos match your search criteria.'
                  : 'Upload your first video to get started.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
