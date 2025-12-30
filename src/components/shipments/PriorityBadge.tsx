import { cn } from '@/lib/utils';

type Priority = 'low' | 'medium' | 'high' | 'urgent';

interface PriorityBadgeProps {
  priority: Priority;
}

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  low: {
    label: 'Low',
    className: 'bg-muted text-muted-foreground',
  },
  medium: {
    label: 'Medium',
    className: 'bg-info/15 text-info',
  },
  high: {
    label: 'High',
    className: 'bg-warning/15 text-warning',
  },
  urgent: {
    label: 'Urgent',
    className: 'bg-destructive/15 text-destructive',
  },
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
