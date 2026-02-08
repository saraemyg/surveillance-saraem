import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface FpsDataPoint {
  time: string
  fps: number
}

interface FpsChartProps {
  data?: FpsDataPoint[]
}

export default function FpsChart({ data }: FpsChartProps) {
  // Mock data if not provided
  const chartData = data || [
    { time: '00:00', fps: 14.2 },
    { time: '04:30', fps: 15.1 },
    { time: '09:00', fps: 14.8 },
    { time: '13:30', fps: 15.3 },
    { time: '18:00', fps: 14.9 },
    { time: '22:30', fps: 15.5 },
  ]

  const avgFps =
    Math.round(
      (chartData.reduce((sum, d) => sum + d.fps, 0) / chartData.length) * 10
    ) / 10

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">FPS Over Time</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Sustained 15 FPS Performance (NFR: FPS1)
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Average</p>
            <p className="text-2xl font-bold text-green-600">{avgFps} FPS</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={[10, 20]} />
              <Tooltip
                formatter={(value) => {
                  const numValue = typeof value === 'number' ? value : parseFloat(String(value))
                  return `${numValue.toFixed(1)} FPS`
                }}
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '6px',
                }}
              />
              <Line
                type="monotone"
                dataKey="fps"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
