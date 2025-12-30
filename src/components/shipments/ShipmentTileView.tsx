import { motion } from 'framer-motion';
import { Shipment } from '@/types/shipment';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MapPin,
  MoreVertical,
  Pencil,
  Flag,
  Trash2,
  Copy,
  Plane,
  Ship,
  Train,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShipmentTileViewProps {
  shipments: Shipment[];
  onSelect: (shipment: Shipment) => void;
  onEdit?: (shipment: Shipment) => void;
  onFlag?: (shipment: Shipment) => void;
  onDelete?: (shipment: Shipment) => void;
}

const typeIcons: Record<string, React.ElementType> = {
  ground: Truck,
  air: Plane,
  ocean: Ship,
  rail: Train,
};

const typeColors: Record<string, string> = {
  ground: 'text-warning',
  air: 'text-info',
  ocean: 'text-primary',
  rail: 'text-accent',
};

export function ShipmentTileView({
  shipments,
  onSelect,
  onEdit,
  onFlag,
  onDelete,
}: ShipmentTileViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {shipments.map((shipment, index) => {
        const TypeIcon = typeIcons[shipment.type] || Truck;
        
        return (
          <motion.div
            key={shipment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="group relative"
          >
            <div
              onClick={() => onSelect(shipment)}
              className={cn(
                'relative rounded-xl border border-border bg-card p-4 cursor-pointer transition-all duration-300',
                'hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5',
                'hover:-translate-y-1'
              )}
            >
              {/* Action Menu */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(shipment); }}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onFlag?.(shipment); }}>
                      <Flag className="mr-2 h-4 w-4" />
                      Flag
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => { e.stopPropagation(); onDelete?.(shipment); }}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Type Icon Badge */}
              <div className={cn(
                'absolute -top-3 -left-3 h-10 w-10 rounded-xl bg-card border border-border flex items-center justify-center',
                typeColors[shipment.type]
              )}>
                <TypeIcon className="h-5 w-5" />
              </div>

              {/* Header */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs text-primary">{shipment.trackingNumber}</span>
                  <PriorityBadge priority={shipment.priority} />
                </div>

                {/* Route */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-sm">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">{shipment.origin}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-sm">
                      <MapPin className="h-3.5 w-3.5 text-accent shrink-0" />
                      <span className="truncate">{shipment.destination}</span>
                    </div>
                  </div>
                </div>

                {/* Status & Details */}
                <div className="flex items-center justify-between">
                  <StatusBadge status={shipment.status} size="sm" />
                  <span className="text-xs text-muted-foreground">
                    {shipment.carrier}
                  </span>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <span>ETA: {new Date(shipment.estimatedDelivery).toLocaleDateString()}</span>
                  <span className="font-mono">${shipment.cost.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
