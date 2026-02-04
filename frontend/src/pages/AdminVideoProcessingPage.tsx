import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cameraService, CameraCreate } from '@/services/cameraService'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'
import {
  Plus,
  Trash2,
  Camera as CameraIcon,
  Loader2,
  Upload,
  Image,
  Layers,
  Settings2,
  CheckCircle2
} from 'lucide-react'

export default function AdminVideoProcessingPage() {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedCameraId, setSelectedCameraId] = useState<number | null>(null)
  const [newCamera, setNewCamera] = useState<CameraCreate>({
    camera_name: '',
    location: '',
    resolution: '1920x1080',
    fps: 30,
  })

  const { data: cameras, isLoading: camerasLoading } = useQuery({
    queryKey: ['cameras'],
    queryFn: () => cameraService.listCameras(true),
  })

  const createCameraMutation = useMutation({
    mutationFn: cameraService.createCamera,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cameras'] })
      setNewCamera({ camera_name: '', location: '', resolution: '1920x1080', fps: 30 })
      toast({ title: 'Camera Added', description: 'New camera has been registered.' })
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    },
  })

  const deleteCameraMutation = useMutation({
    mutationFn: cameraService.deleteCamera,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cameras'] })
      toast({ title: 'Camera Deleted' })
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    },
  })

  const generateMaskMutation = useMutation({
    mutationFn: ({ cameraId, file }: { cameraId: number; file: File }) =>
      cameraService.generateMask(cameraId, file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cameras'] })
      toast({
        title: 'Mask Generated',
        description: `Segmentation mask created with ${data.reduction_percentage?.toFixed(1) || 0}% area reduction.`,
      })
      setSelectedCameraId(null)
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    },
  })

  const handleAddCamera = () => {
    if (newCamera.camera_name) {
      createCameraMutation.mutate(newCamera)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && selectedCameraId) {
      generateMaskMutation.mutate({ cameraId: selectedCameraId, file })
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleGenerateMask = (cameraId: number) => {
    setSelectedCameraId(cameraId)
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Video Processing Configuration</h1>
        <p className="text-muted-foreground">
          Configure camera settings and generate segmentation masks
        </p>
      </div>

      {/* Hidden file input for mask generation */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Side by Side Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - Camera Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Settings2 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Camera Settings</h2>
          </div>

          {/* Add Camera Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add New Camera</CardTitle>
              <CardDescription>Register a new surveillance camera</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Camera Name *</Label>
                    <Input
                      placeholder="e.g., Entrance Camera"
                      value={newCamera.camera_name}
                      onChange={(e) =>
                        setNewCamera({ ...newCamera, camera_name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      placeholder="e.g., Main Entrance"
                      value={newCamera.location || ''}
                      onChange={(e) =>
                        setNewCamera({ ...newCamera, location: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Resolution</Label>
                    <Input
                      placeholder="1920x1080"
                      value={newCamera.resolution || ''}
                      onChange={(e) =>
                        setNewCamera({ ...newCamera, resolution: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>FPS</Label>
                    <Input
                      type="number"
                      placeholder="30"
                      value={newCamera.fps || ''}
                      onChange={(e) =>
                        setNewCamera({ ...newCamera, fps: parseFloat(e.target.value) || 30 })
                      }
                    />
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={handleAddCamera}
                  disabled={!newCamera.camera_name || createCameraMutation.isPending}
                >
                  {createCameraMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Add Camera
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Camera List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Registered Cameras</CardTitle>
            </CardHeader>
            <CardContent>
              {camerasLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : cameras && cameras.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {cameras.map((camera) => (
                    <div
                      key={camera.camera_id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <CameraIcon className="h-6 w-6 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{camera.camera_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {camera.location || 'No location'} | {camera.resolution} | {camera.fps} FPS
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={camera.is_active ? 'success' : 'secondary'} className="text-xs">
                          {camera.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => deleteCameraMutation.mutate(camera.camera_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No cameras registered
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Segmentation Mask Generation */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Generate Segmentation Mask</h2>
          </div>

          {/* Mask Generation Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mask Generation</CardTitle>
              <CardDescription>
                Create segmentation masks for efficient video processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">How it works:</h4>
                  <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                    <li>Select a camera from the list below</li>
                    <li>Upload a sample frame from that camera</li>
                    <li>The system will generate a segmentation mask</li>
                    <li>Mask helps reduce processing area and improves efficiency</li>
                  </ol>
                </div>

                {generateMaskMutation.isPending && (
                  <div className="flex items-center justify-center p-6 border rounded-lg bg-primary/5">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                      <p className="text-sm font-medium">Generating segmentation mask...</p>
                      <p className="text-xs text-muted-foreground">This may take a moment</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Camera List for Mask Generation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Camera for Mask Generation</CardTitle>
              <CardDescription>
                Choose a camera and upload a sample frame to generate its mask
              </CardDescription>
            </CardHeader>
            <CardContent>
              {camerasLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : cameras && cameras.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {cameras.filter(c => c.is_active).map((camera) => (
                    <div
                      key={camera.camera_id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <CameraIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{camera.camera_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {camera.location || 'No location'}
                          </p>
                          {camera.mask_file_path && (
                            <div className="flex items-center gap-1 mt-1">
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                              <span className="text-xs text-green-600">Mask generated</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleGenerateMask(camera.camera_id)}
                        disabled={generateMaskMutation.isPending}
                        variant={camera.mask_file_path ? 'outline' : 'default'}
                        size="sm"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {camera.mask_file_path ? 'Regenerate' : 'Generate'} Mask
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Image className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    No active cameras available
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Add a camera first to generate masks
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
