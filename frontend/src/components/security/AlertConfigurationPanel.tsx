import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'

export interface AlertConfigThresholds {
  confidenceThreshold: number
  highPriorityThreshold: number
  notificationInterval: number
}

interface AlertConfigurationPanelProps {
  onConfigChange?: (config: AlertConfigThresholds) => void
}

export function AlertConfigurationPanel({
  onConfigChange,
}: AlertConfigurationPanelProps) {
  const [config, setConfig] = useState<AlertConfigThresholds>({
    confidenceThreshold: 70,
    highPriorityThreshold: 80,
    notificationInterval: 5,
  })

  const handleConfigChange = (
    key: keyof AlertConfigThresholds,
    value: number
  ) => {
    const newConfig = { ...config, [key]: value }
    setConfig(newConfig)
    onConfigChange?.(newConfig)
  }

  return (
    <Card className="dark:border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Alert Criteria Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Confidence Threshold */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-base font-medium">
              Minimum Confidence Threshold
            </Label>
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              {config.confidenceThreshold}%
            </span>
          </div>
          <Slider
            value={[config.confidenceThreshold]}
            onValueChange={(value) =>
              handleConfigChange('confidenceThreshold', value[0])
            }
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Alerts below this confidence level will be filtered out automatically
          </p>
        </div>

        {/* High Priority Threshold */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-base font-medium">
              High Priority Threshold
            </Label>
            <span className="text-sm font-semibold text-red-600 dark:text-red-400">
              {config.highPriorityThreshold}%
            </span>
          </div>
          <Slider
            value={[config.highPriorityThreshold]}
            onValueChange={(value) =>
              handleConfigChange('highPriorityThreshold', value[0])
            }
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Detections above this confidence will be marked as high priority
          </p>
        </div>

        {/* Notification Interval */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-base font-medium">
              Notification Interval
            </Label>
            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
              Every {config.notificationInterval}s
            </span>
          </div>
          <Slider
            value={[config.notificationInterval]}
            onValueChange={(value) =>
              handleConfigChange('notificationInterval', value[0])
            }
            min={1}
            max={30}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Minimum time between alert notifications for the same detection
          </p>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs text-blue-900 dark:text-blue-100">
            <strong>Tip:</strong> Adjust these thresholds to reduce false
            positives and focus on critical alerts. Changes apply immediately.
          </p>
        </div>

        {/* Reset Button */}
        <Button
          variant="outline"
          className="w-full dark:bg-gray-800 dark:border-gray-700"
          onClick={() => {
            const defaults: AlertConfigThresholds = {
              confidenceThreshold: 70,
              highPriorityThreshold: 80,
              notificationInterval: 5,
            }
            setConfig(defaults)
            onConfigChange?.(defaults)
          }}
        >
          Reset to Defaults
        </Button>
      </CardContent>
    </Card>
  )
}
