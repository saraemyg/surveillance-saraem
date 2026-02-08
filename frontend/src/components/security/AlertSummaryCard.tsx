interface AlertSummaryCardProps {
  title: string
  count: number
  description: string
  icon: React.ReactNode
  bgColor: string
  borderColor: string
  textColor: string
}

export default function AlertSummaryCard({
  title,
  count,
  description,
  icon,
  bgColor,
  borderColor,
  textColor,
}: AlertSummaryCardProps) {
  return (
    <div
      className={`${bgColor} border-l-4 ${borderColor} rounded-lg p-4 flex items-start gap-3`}
    >
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-grow">
        <p className="text-xs font-medium text-muted-foreground mb-1">{title}</p>
        <p className={`text-3xl font-bold ${textColor}`}>{count}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  )
}
