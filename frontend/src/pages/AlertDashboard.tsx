import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, AlertCircle, Shield, Bell } from 'lucide-react'
import {
  AlertHistoryTable,
  type AlertHistoryEntry,
} from '@/components/security/AlertHistoryTable'
import { BehaviorDistributionChart } from '@/components/security/BehaviorDistributionChart'
import { AlertPriorityChart } from '@/components/security/AlertPriorityChart'
import { AlertFilterBar, type FilterOptions } from '@/components/security/AlertFilterBar'
import {
  AlertConfigurationPanel,
  type AlertConfigThresholds,
} from '@/components/security/AlertConfigurationPanel'

// Mock alert history data
const mockAlertHistory: AlertHistoryEntry[] = [
  {
    id: 'ALT-001',
    timestamp: '2024-02-09 14:35:22',
    camera: 'Entrance A',
    behavior: 'RUN',
    confidence: 0.95,
    priority: 'HIGH',
    status: 'NEW',
  },
  {
    id: 'ALT-002',
    timestamp: '2024-02-09 14:28:15',
    camera: 'Hallway B',
    behavior: 'WALK',
    confidence: 0.87,
    priority: 'MEDIUM',
    status: 'ACKNOWLEDGED',
  },
  {
    id: 'ALT-003',
    timestamp: '2024-02-09 14:22:08',
    camera: 'Lobby',
    behavior: 'SIT',
    confidence: 0.72,
    priority: 'LOW',
    status: 'RESOLVED',
  },
  {
    id: 'ALT-004',
    timestamp: '2024-02-09 14:15:45',
    camera: 'Entrance A',
    behavior: 'STAND',
    confidence: 0.68,
    priority: 'LOW',
    status: 'FALSE_POSITIVE',
  },
  {
    id: 'ALT-005',
    timestamp: '2024-02-09 14:10:32',
    camera: 'Storage Room',
    behavior: 'BEND',
    confidence: 0.82,
    priority: 'MEDIUM',
    status: 'ACKNOWLEDGED',
  },
  {
    id: 'ALT-006',
    timestamp: '2024-02-09 14:05:18',
    camera: 'Exit Door',
    behavior: 'RUN',
    confidence: 0.91,
    priority: 'HIGH',
    status: 'NEW',
  },
  {
    id: 'ALT-007',
    timestamp: '2024-02-09 13:58:42',
    camera: 'Hallway B',
    behavior: 'LAY',
    confidence: 0.89,
    priority: 'HIGH',
    status: 'ACKNOWLEDGED',
  },
  {
    id: 'ALT-008',
    timestamp: '2024-02-09 13:52:11',
    camera: 'Entrance B',
    behavior: 'WALK',
    confidence: 0.75,
    priority: 'LOW',
    status: 'RESOLVED',
  },
  {
    id: 'ALT-009',
    timestamp: '2024-02-09 13:45:33',
    camera: 'Lobby',
    behavior: 'FIGHT',
    confidence: 0.94,
    priority: 'HIGH',
    status: 'NEW',
  },
  {
    id: 'ALT-010',
    timestamp: '2024-02-09 13:40:22',
    camera: 'Hallway A',
    behavior: 'STAND',
    confidence: 0.71,
    priority: 'LOW',
    status: 'FALSE_POSITIVE',
  },
  {
    id: 'ALT-011',
    timestamp: '2024-02-09 13:35:08',
    camera: 'Storage Room',
    behavior: 'RUN',
    confidence: 0.88,
    priority: 'MEDIUM',
    status: 'ACKNOWLEDGED',
  },
  {
    id: 'ALT-012',
    timestamp: '2024-02-09 13:28:45',
    camera: 'Entrance A',
    behavior: 'WALK',
    confidence: 0.79,
    priority: 'LOW',
    status: 'RESOLVED',
  },
  {
    id: 'ALT-013',
    timestamp: '2024-02-09 13:22:30',
    camera: 'Exit Door',
    behavior: 'BEND',
    confidence: 0.85,
    priority: 'MEDIUM',
    status: 'NEW',
  },
  {
    id: 'ALT-014',
    timestamp: '2024-02-09 13:15:17',
    camera: 'Hallway B',
    behavior: 'SIT',
    confidence: 0.73,
    priority: 'LOW',
    status: 'ACKNOWLEDGED',
  },
  {
    id: 'ALT-015',
    timestamp: '2024-02-09 13:08:55',
    camera: 'Lobby',
    behavior: 'STAND',
    confidence: 0.69,
    priority: 'LOW',
    status: 'FALSE_POSITIVE',
  },
  {
    id: 'ALT-016',
    timestamp: '2024-02-09 13:02:41',
    camera: 'Entrance B',
    behavior: 'RUN',
    confidence: 0.92,
    priority: 'HIGH',
    status: 'ACKNOWLEDGED',
  },
  {
    id: 'ALT-017',
    timestamp: '2024-02-09 12:56:20',
    camera: 'Storage Room',
    behavior: 'WALK',
    confidence: 0.78,
    priority: 'LOW',
    status: 'RESOLVED',
  },
  {
    id: 'ALT-018',
    timestamp: '2024-02-09 12:49:33',
    camera: 'Hallway A',
    behavior: 'LAY',
    confidence: 0.87,
    priority: 'HIGH',
    status: 'NEW',
  },
  {
    id: 'ALT-019',
    timestamp: '2024-02-09 12:43:08',
    camera: 'Exit Door',
    behavior: 'STAND',
    confidence: 0.72,
    priority: 'LOW',
    status: 'FALSE_POSITIVE',
  },
  {
    id: 'ALT-020',
    timestamp: '2024-02-09 12:36:45',
    camera: 'Entrance A',
    behavior: 'FIGHT',
    confidence: 0.96,
    priority: 'HIGH',
    status: 'ACKNOWLEDGED',
  },
]

type SummaryCard = {
  label: string
  value: number
  icon: React.ReactNode
  color: string
}

export function AlertDashboard() {
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    camera: '',
    behavior: '',
    priority: '',
    status: '',
  })
  const [alertConfig, setAlertConfig] = useState<AlertConfigThresholds>({
    confidenceThreshold: 70,
    highPriorityThreshold: 80,
    notificationInterval: 5,
  })

  // Extract unique cameras from mock data
  const camerasSet = new Set(mockAlertHistory.map((a) => a.camera))
  const camerasArray = Array.from(camerasSet).sort()
  const behaviorsArray = ['RUN', 'BEND', 'STAND', 'WALK', 'LAY', 'SIT', 'FIGHT']

  // Filter alerts based on active filters
  const filteredAlerts = useMemo(() => {
    return mockAlertHistory.filter((alert) => {
      const matchesSearch =
        filters.search === '' ||
        alert.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        alert.camera.toLowerCase().includes(filters.search.toLowerCase())

      const matchesCamera = filters.camera === '' || alert.camera === filters.camera
      const matchesBehavior =
        filters.behavior === '' || alert.behavior === filters.behavior
      const matchesPriority =
        filters.priority === '' || alert.priority === filters.priority
      const matchesStatus = filters.status === '' || alert.status === filters.status
      const matchesConfidence = alert.confidence * 100 >= alertConfig.confidenceThreshold

      return (
        matchesSearch &&
        matchesCamera &&
        matchesBehavior &&
        matchesPriority &&
        matchesStatus &&
        matchesConfidence
      )
    })
  }, [filters, alertConfig])

  // Calculate summary statistics
  const totalAlerts = filteredAlerts.length
  const highPriorityAlerts = filteredAlerts.filter(
    (a) => a.priority === 'HIGH'
  ).length
  const mediumPriorityAlerts = filteredAlerts.filter(
    (a) => a.priority === 'MEDIUM'
  ).length
  const lowPriorityAlerts = filteredAlerts.filter((a) => a.priority === 'LOW').length

  const summaryCards: SummaryCard[] = [
    {
      label: 'Total Alerts',
      value: totalAlerts,
      icon: <Bell className="w-5 h-5" />,
      color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    },
    {
      label: 'High Priority',
      value: highPriorityAlerts,
      icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
      color: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    },
    {
      label: 'Medium Priority',
      value: mediumPriorityAlerts,
      icon: <AlertCircle className="w-5 h-5 text-orange-600" />,
      color: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    },
    {
      label: 'Low Priority',
      value: lowPriorityAlerts,
      icon: <Shield className="w-5 h-5 text-blue-600" />,
      color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    },
  ]

  // Behavior distribution data
  const behaviorDistribution = behaviorsArray.map((behavior) => ({
    behavior,
    count: filteredAlerts.filter((a) => a.behavior === behavior).length,
  }))

  // Priority distribution data
  const priorityDistribution = [
    { priority: 'HIGH' as const, count: highPriorityAlerts },
    { priority: 'MEDIUM' as const, count: mediumPriorityAlerts },
    { priority: 'LOW' as const, count: lowPriorityAlerts },
    {
      priority: 'PENDING' as const,
      count: filteredAlerts.filter((a) => a.priority === 'PENDING').length,
    },
  ]

  const handleExportCsv = () => {
    // Generate CSV headers
    const headers = [
      'ID',
      'Timestamp',
      'Camera',
      'Behavior',
      'Confidence',
      'Priority',
      'Status',
    ]
    const csvContent = [
      headers.join(','),
      ...filteredAlerts.map((alert) =>
        [
          alert.id,
          alert.timestamp,
          alert.camera,
          alert.behavior,
          `${(alert.confidence * 100).toFixed(1)}%`,
          alert.priority,
          alert.status,
        ].join(',')
      ),
    ].join('\n')

    // Create blob and download
    const element = document.createElement('a')
    element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`)
    element.setAttribute('download', `alert-history-${new Date().toISOString().split('T')[0]}.csv`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Alert Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time monitoring and analysis of all detected alerts
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className={`border ${card.color}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {card.label}
                  </p>
                  <p className="text-2xl font-bold mt-2">{card.value}</p>
                </div>
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                  {card.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Behavior Distribution */}
        <div className="lg:col-span-1">
          <BehaviorDistributionChart data={behaviorDistribution} />
        </div>

        {/* Priority Distribution */}
        <div className="lg:col-span-1">
          <AlertPriorityChart data={priorityDistribution} />
        </div>

        {/* Alert Configuration */}
        <div className="lg:col-span-1">
          <AlertConfigurationPanel onConfigChange={setAlertConfig} />
        </div>
      </div>

      {/* Filter Bar */}
      <AlertFilterBar
        cameras={camerasArray}
        behaviors={behaviorsArray}
        onFilterChange={setFilters}
        onExportCsv={handleExportCsv}
      />

      {/* Alert History Table */}
      <Card className="dark:border-gray-700">
        <CardHeader>
          <CardTitle>Alert History</CardTitle>
        </CardHeader>
        <CardContent>
          <AlertHistoryTable
            data={filteredAlerts}
            currentPage={1}
            pageSize={10}
          />
        </CardContent>
      </Card>
    </div>
  )
}
