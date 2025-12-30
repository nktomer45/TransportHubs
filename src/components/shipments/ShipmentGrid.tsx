import { Shipment } from '@/types/shipment';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plane, Ship, Train, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShipmentGridProps {
  shipments: Shipment[];
  onSelect: (shipment: Shipment) => void;
}

const typeIcons: Record<string, React.ElementType> = {
  ground: Truck,
  air: Plane,
  ocean: Ship,
  rail: Train,
};

export function ShipmentGrid({ shipments, onSelect }: ShipmentGridProps) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="font-semibold">Tracking #</TableHead>
              <TableHead className="font-semibold">Origin</TableHead>
              <TableHead className="font-semibold">Destination</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Type</TableHead>
              <TableHead className="font-semibold">Carrier</TableHead>
              <TableHead className="font-semibold">Priority</TableHead>
              <TableHead className="font-semibold text-right">Weight</TableHead>
              <TableHead className="font-semibold text-right">Cost</TableHead>
              <TableHead className="font-semibold">ETA</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shipments.map((shipment, index) => {
              const TypeIcon = typeIcons[shipment.type] || Truck;
              return (
                <TableRow
                  key={shipment.id}
                  onClick={() => onSelect(shipment)}
                  className={cn(
                    'cursor-pointer transition-colors',
                    index % 2 === 0 ? 'bg-card' : 'bg-card/50'
                  )}
                >
                  <TableCell className="font-mono text-sm text-primary">
                    {shipment.trackingNumber}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate">
                    {shipment.origin}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate">
                    {shipment.destination}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={shipment.status} size="sm" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TypeIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize text-sm">{shipment.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>{shipment.carrier}</TableCell>
                  <TableCell>
                    <PriorityBadge priority={shipment.priority} />
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {shipment.weight.toLocaleString()} kg
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    ${shipment.cost.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(shipment.estimatedDelivery).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
