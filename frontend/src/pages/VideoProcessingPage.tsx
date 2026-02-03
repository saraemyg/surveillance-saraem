import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { videoService } from '@/services'
import VideoUploader from '@/components/video/VideoUploader'
import ProcessingStatus from '@/components/video/ProcessingStatus'
import { toast } from '@/components/ui/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'

export default function VideoProcessingPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('all')

  const { data: videos, isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: () => videoService.listVideos({ limit: 50 }),
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
        description: 'The video has been removed.',
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

  const filteredVideos = videos?.filter((video) => {
    if (activeTab === 'all') return true
    return video.processing_status === activeTab
  }) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Video Processing</h1>
        <p className="text-muted-foreground">
          Upload and process surveillance videos
        </p>
      </div>

      {/* Upload Section */}
      <VideoUploader onUploadComplete={handleUploadComplete} />

      {/* Video List */}
      <div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({videos?.length || 0})</TabsTrigger>
            <TabsTrigger value="uploaded">
              Uploaded ({videos?.filter((v) => v.processing_status === 'uploaded').length || 0})
            </TabsTrigger>
            <TabsTrigger value="processing">
              Processing ({videos?.filter((v) => v.processing_status === 'processing').length || 0})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({videos?.filter((v) => v.processing_status === 'completed').length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <ProcessingStatus
                videos={filteredVideos}
                onProcess={(videoId) => processMutation.mutate(videoId)}
                onDelete={(videoId) => deleteMutation.mutate(videoId)}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
