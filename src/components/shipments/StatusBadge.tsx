import { cn } from '@/lib/utils';
import { ShipmentStatus } from '@/types/shipment';

interface StatusBadgeProps {
  status: ShipmentStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<ShipmentStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-warning/15 text-warning border-warning/30',
  },
  picked_up: {
    label: 'Picked Up',
    className: 'bg-info/15 text-info border-info/30',
  },
  in_transit: {
    label: 'In Transit',
    className: 'bg-info/15 text-info border-info/30',
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    className: 'bg-primary/15 text-primary border-primary/30',
  },
  delivered: {
    label: 'Delivered',
    className: 'bg-success/15 text-success border-success/30',
  },
  delayed: {
    label: 'Delayed',
    className: 'bg-destructive/15 text-destructive border-destructive/30',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-muted text-muted-foreground border-border',
  },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        config.className,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      )}
    >
      <span className={cn(
        'mr-1.5 rounded-full',
        status === 'in_transit' && 'animate-pulse',
        size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2'
      )} style={{ backgroundColor: 'currentColor' }} />
      {config.label}
    </span>
  );
}
