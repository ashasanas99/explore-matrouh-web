import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: string
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}

export default function EmptyState({ icon = '📭', title, subtitle, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      <div className="text-5xl mb-4 select-none">{icon}</div>
      <h3 className="text-base font-bold text-foreground font-sans mb-2">{title}</h3>
      {subtitle && <p className="text-sm text-muted-foreground font-sans max-w-xs">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
