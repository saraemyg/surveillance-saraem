import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cameraService, CameraCreate } from '@/services/cameraService'
import { authService } from '@/services'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/components/ui/use-toast'
import { Plus, Trash2, Camera as CameraIcon, Users, Settings, Loader2 } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
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

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: authService.listUsers,
    enabled: user?.role === 'admin',
  })

  const createCameraMutation = useMutation({
    mutationFn: cameraService.createCamera,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cameras'] })
      setNewCamera({ camera_name: '', location: '', resolution: '1920x1080', fps: 30 })
      toast({ title: 'Camera Added', description: 'New camera has been added.' })
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

  const toggleUserMutation = useMutation({
    mutationFn: authService.toggleUserActive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast({ title: 'User Updated' })
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

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Admin access required</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          System configuration and management
        </p>
      </div>

      <Tabs defaultValue="cameras">
        <TabsList>
          <TabsTrigger value="cameras">
            <CameraIcon className="h-4 w-4 mr-2" />
            Cameras
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="system">
            <Settings className="h-4 w-4 mr-2" />
            System
          </TabsTrigger>
        </TabsList>

        {/* Cameras Tab */}
        <TabsContent value="cameras" className="space-y-4">
          {/* Add Camera Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Camera</CardTitle>
              <CardDescription>Register a new surveillance camera</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Camera Name</Label>
                  <Input
                    placeholder="Camera name"
                    value={newCamera.camera_name}
                    onChange={(e) =>
                      setNewCamera({ ...newCamera, camera_name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    placeholder="Location"
                    value={newCamera.location || ''}
                    onChange={(e) =>
                      setNewCamera({ ...newCamera, location: e.target.value })
                    }
                  />
                </div>
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
                className="mt-4"
                onClick={handleAddCamera}
                disabled={!newCamera.camera_name || createCameraMutation.isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Camera
              </Button>
            </CardContent>
          </Card>

          {/* Camera List */}
          <Card>
            <CardHeader>
              <CardTitle>Registered Cameras</CardTitle>
            </CardHeader>
            <CardContent>
              {camerasLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : cameras && cameras.length > 0 ? (
                <div className="space-y-3">
                  {cameras.map((camera) => (
                    <div
                      key={camera.camera_id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <CameraIcon className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{camera.camera_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {camera.location || 'No location'} | {camera.resolution} |{' '}
                            {camera.fps} FPS
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={camera.is_active ? 'success' : 'secondary'}>
                          {camera.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="icon"
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
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage system users</CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : users && users.length > 0 ? (
                <div className="space-y-3">
                  {users.map((u) => (
                    <div
                      key={u.user_id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{u.username}</p>
                        <p className="text-sm text-muted-foreground">
                          {u.email} | {u.role.replace('_', ' ')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={u.is_active ? 'success' : 'secondary'}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {u.user_id !== user?.user_id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleUserMutation.mutate(u.user_id)}
                          >
                            {u.is_active ? 'Disable' : 'Enable'}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No users found
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>Processing parameters and settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Detection Confidence Threshold</Label>
                  <Input type="number" defaultValue="0.6" step="0.1" min="0" max="1" />
                </div>
                <div className="space-y-2">
                  <Label>Attribute Recognition Interval (frames)</Label>
                  <Input type="number" defaultValue="5" min="1" />
                </div>
                <div className="space-y-2">
                  <Label>Max Upload Size (MB)</Label>
                  <Input type="number" defaultValue="500" />
                </div>
                <div className="space-y-2">
                  <Label>Video Retention Period (days)</Label>
                  <Input type="number" defaultValue="30" />
                </div>
              </div>
              <Button className="mt-4">Save Settings</Button>
              <p className="text-sm text-muted-foreground mt-2">
                Note: Settings changes require system restart to take effect.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
