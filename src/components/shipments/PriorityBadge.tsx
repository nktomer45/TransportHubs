import { cn } from '@/lib/utils';
import { ShipmentPriority } from '@/types/shipment';

interface PriorityBadgeProps {
  priority: ShipmentPriority;
}

const priorityConfig: Record<ShipmentPriority, { label: string; className: string }> = {
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
  critical: {
    label: 'Critical',
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
