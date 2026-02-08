import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { metricsService } from '@/services'
import MetricsCard from '@/components/dashboard/MetricsCard'
import { ColorChart, DetectionsChart } from '@/components/dashboard/PerformanceChart'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDateTime } from '@/utils/formatters'
import {
  Video,
  Users,
  Gauge,
  Loader2,
  AlertTriangle,
  Plus,
  FileText,
  CheckCircle,
  XCircle,
  Clock3
} from 'lucide-react'

interface Incident {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'investigating' | 'resolved'
  location: string
  timestamp: string
  reportedBy: string
}

// Mock incidents data - In production this would come from the backend
const mockIncidents: Incident[] = [
  {
    id: '1',
    title: 'Unauthorized Access Attempt',
    description: 'Individual attempted to enter restricted area without credentials',
    severity: 'high',
    status: 'investigating',
    location: 'Building A - Back Entrance',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    reportedBy: 'System Auto-Detection'
  },
  {
    id: '2',
    title: 'Suspicious Activity',
    description: 'Person loitering near storage facility for extended period',
    severity: 'medium',
    status: 'open',
    location: 'Storage Facility - Zone C',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    reportedBy: 'Security Personnel'
  },
  {
    id: '3',
    title: 'Equipment Malfunction',
    description: 'Camera 5 showing intermittent feed issues',
    severity: 'low',
    status: 'resolved',
    location: 'Parking Lot - East Wing',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    reportedBy: 'System Alert'
  }
]

export default function SecurityDashboardPage() {
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents)
  const [showNewIncident, setShowNewIncident] = useState(false)
  const [newIncident, setNewIncident] = useState<{
    title: string
    description: string
    severity: Incident['severity']
    location: string
  }>({
    title: '',
    description: '',
    severity: 'medium',
    location: ''
  })

  const { data: summary, isLoading } = useQuery({
    queryKey: ['metricsSummary'],
    queryFn: metricsService.getSummary,
  })

  const { data: videoMetrics } = useQuery({
    queryKey: ['videoMetrics'],
    queryFn: () => metricsService.getVideoMetrics(10),
  })

  const { data: attributeMetrics } = useQuery({
    queryKey: ['attributeMetrics'],
    queryFn: metricsService.getAttributeMetrics,
  })

  const handleAddIncident = () => {
    if (newIncident.title && newIncident.description) {
      const incident: Incident = {
        id: Date.now().toString(),
        ...newIncident,
        status: 'open',
        timestamp: new Date().toISOString(),
        reportedBy: 'Security Personnel'
      }
      setIncidents([incident, ...incidents])
      setNewIncident({ title: '', description: '', severity: 'medium', location: '' })
      setShowNewIncident(false)
    }
  }

  const updateIncidentStatus = (id: string, status: Incident['status']) => {
    setIncidents(incidents.map(inc =>
      inc.id === id ? { ...inc, status } : inc
    ))
  }

  const getSeverityColor = (severity: Incident['severity']) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'warning'
      case 'low': return 'secondary'
      default: return 'secondary'
    }
  }

  const getStatusIcon = (status: Incident['status']) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'investigating': return <Clock3 className="h-4 w-4 text-yellow-500" />
      case 'open': return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const detectionsData = videoMetrics?.map((v) => ({
    name: v.filename.length > 15 ? v.filename.slice(0, 12) + '...' : v.filename,
    detections: v.total_detections,
  })) || []

  const openIncidents = incidents.filter(i => i.status !== 'resolved').length
  const criticalIncidents = incidents.filter(i => i.severity === 'critical' || i.severity === 'high').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Security Dashboard</h1>
        <p className="text-muted-foreground">
          Performance metrics and incident management
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <MetricsCard
          title="Total Videos"
          value={summary?.total_videos || 0}
          icon={Video}
          description="Processed videos"
        />
        <MetricsCard
          title="Total Detections"
          value={summary?.total_detections || 0}
          icon={Users}
          description="Person detections"
        />
        <MetricsCard
          title="Average FPS"
          value={summary?.average_fps?.toFixed(2) || '0.00'}
          icon={Gauge}
          description="Processing speed"
        />
        <MetricsCard
          title="Open Incidents"
          value={openIncidents}
          icon={AlertTriangle}
          description="Pending review"
        />
        <MetricsCard
          title="High Priority"
          value={criticalIncidents}
          icon={AlertTriangle}
          description="Critical/High"
        />
      </div>

      {/* Charts and Incidents Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Charts Column */}
        <div className="space-y-4">
          {detectionsData.length > 0 && (
            <DetectionsChart data={detectionsData} />
          )}
        </div>

        {/* Incidents Column */}
        <Card className="h-fit">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Cases & Incidents Activity
                </CardTitle>
                <CardDescription>Recent security incidents and reports</CardDescription>
              </div>
              <Button size="sm" onClick={() => setShowNewIncident(!showNewIncident)}>
                <Plus className="h-4 w-4 mr-1" />
                Report
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* New Incident Form */}
            {showNewIncident && (
              <div className="mb-4 p-4 border rounded-lg bg-muted/50 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Title</Label>
                    <Input
                      placeholder="Incident title"
                      value={newIncident.title}
                      onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Location</Label>
                    <Input
                      placeholder="Location"
                      value={newIncident.location}
                      onChange={(e) => setNewIncident({ ...newIncident, location: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    placeholder="Describe the incident..."
                    value={newIncident.description}
                    onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Select
                    value={newIncident.severity}
                    onValueChange={(value) =>
                      setNewIncident({ ...newIncident, severity: value as Incident['severity'] })
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setShowNewIncident(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleAddIncident}>
                      Submit
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Incidents List */}
            <div className="space-y-3 max-h-[450px] overflow-y-auto">
              {incidents.map((incident) => (
                <div
                  key={incident.id}
                  className="p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(incident.status)}
                      <span className="font-medium text-sm">{incident.title}</span>
                    </div>
                    <Badge variant={getSeverityColor(incident.severity)} className="text-xs">
                      {incident.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {incident.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{incident.location}</span>
                    <span>{formatDateTime(incident.timestamp)}</span>
                  </div>
                  {incident.status !== 'resolved' && (
                    <div className="flex gap-2 mt-2">
                      {incident.status === 'open' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => updateIncidentStatus(incident.id, 'investigating')}
                        >
                          Investigate
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => updateIncidentStatus(incident.id, 'resolved')}
                      >
                        Resolve
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Color Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {attributeMetrics && attributeMetrics.upper_color_distribution.length > 0 && (
          <ColorChart
            data={attributeMetrics.upper_color_distribution}
            title="Upper Body Colors"
          />
        )}
        {attributeMetrics && attributeMetrics.lower_color_distribution.length > 0 && (
          <ColorChart
            data={attributeMetrics.lower_color_distribution}
            title="Lower Body Colors"
          />
        )}
      </div>
    </div>
  )
}
