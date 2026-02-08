import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export interface PriorityData {
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'PENDING'
  count: number
}

interface AlertPriorityChartProps {
  data: PriorityData[]
}

const PRIORITY_COLORS: { [key: string]: string } = {
  HIGH: '#ef4444', // red
  MEDIUM: '#f97316', // orange
  LOW: '#3b82f6', // blue
  PENDING: '#9ca3af', // gray
}

export function AlertPriorityChart({ data }: AlertPriorityChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    fill: PRIORITY_COLORS[item.priority],
  }))

  return (
    <Card className="dark:border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Alert Priority Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="dark:stroke-gray-700"
              />
              <XAxis
                dataKey="priority"
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                formatter={(value: number) => [value, 'Count']}
              />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Number of Alerts">
                {chartData.map((entry) => (
                  <Cell key={`cell-${entry.priority}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
