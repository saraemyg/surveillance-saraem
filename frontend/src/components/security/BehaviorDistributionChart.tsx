import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export interface BehaviorData {
  behavior: string
  count: number
}

interface BehaviorDistributionChartProps {
  data: BehaviorData[]
}

const BEHAVIOR_COLORS: { [key: string]: string } = {
  RUN: '#ef4444', // red
  BEND: '#f97316', // orange
  STAND: '#eab308', // yellow
  WALK: '#22c55e', // green
  LAY: '#ef4444', // red
  SIT: '#eab308', // yellow
  FIGHT: '#ef4444', // red
}

export function BehaviorDistributionChart({
  data,
}: BehaviorDistributionChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    fill: BEHAVIOR_COLORS[item.behavior] || '#6b7280',
  }))

  return (
    <Card className="dark:border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Behavior Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ behavior, count }) => `${behavior}: ${count}`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="count"
              >
                {chartData.map((entry) => (
                  <Cell key={`cell-${entry.behavior}`} fill={entry.fill} />
                ))}
              </Pie>
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
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
