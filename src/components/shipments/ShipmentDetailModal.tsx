import { motion, AnimatePresence } from 'framer-motion';
import { Shipment } from '@/types/shipment';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { Button } from '@/components/ui/button';
import {
  X,
  MapPin,
  Plane,
  Ship,
  Train,
  Truck,
  Calendar,
  Package,
  DollarSign,
  User,
  Building,
  FileText,
  ArrowRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface ShipmentDetailModalProps {
  shipment: Shipment | null;
  isOpen: boolean;
  onClose: () => void;
}

const typeIcons: Record<string, React.ElementType> = {
  ground: Truck,
  air: Plane,
  ocean: Ship,
  rail: Train,
};

export function ShipmentDetailModal({ shipment, isOpen, onClose }: ShipmentDetailModalProps) {
  if (!shipment) return null;

  const TypeIcon = typeIcons[shipment.type] || Truck;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:left-1/4 md:top-0 md:-translate-x-1/2 md:-translate-y-1/2 z-50 md:w-full md:max-w-2xl md:max-h-[90vh] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            {/* Header */}
            <div className="relative gradient-primary p-6 pb-12">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-4 right-4 text-primary-foreground hover:bg-primary-foreground/20"
              >
                <X className="h-5 w-5" />
              </Button>

              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                  <TypeIcon className="h-7 w-7 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-primary-foreground/70 text-sm mb-1">Shipment</p>
                  <h2 className="font-display text-2xl font-bold text-primary-foreground">
                    {shipment.trackingNumber}
                  </h2>
                </div>
              </div>

              {/* Status Cards */}
              <div className="absolute -bottom-6 left-6 right-6 flex gap-3">
                <div className="flex-1 rounded-xl bg-card border border-border p-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={shipment.status} />
                  </div>
                </div>
                <div className="flex-1 rounded-xl bg-card border border-border p-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={shipment.priority} />
                    <span className="text-sm text-muted-foreground">Priority</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 pt-10 overflow-y-auto max-h-[calc(90vh-200px)] scrollbar-thin">
              {/* Route Section */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Route Details
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1 rounded-xl bg-muted/30 p-4">
                    <div className="flex items-center gap-2 text-primary mb-1">
                      <MapPin className="h-4 w-4" />
                      <span className="text-xs font-medium uppercase">Origin</span>
                    </div>
                    <p className="font-medium">{shipment.origin}</p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-px bg-border" />
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    <div className="w-8 h-px bg-border" />
                  </div>
                  <div className="flex-1 rounded-xl bg-muted/30 p-4">
                    <div className="flex items-center gap-2 text-accent mb-1">
                      <MapPin className="h-4 w-4" />
                      <span className="text-xs font-medium uppercase">Destination</span>
                    </div>
                    <p className="font-medium">{shipment.destination}</p>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <DetailItem
                  icon={Truck}
                  label="Carrier"
                  value={shipment.carrier}
                />
                <DetailItem
                  icon={Package}
                  label="Weight"
                  value={`${shipment.weight.toLocaleString()} kg`}
                />
                <DetailItem
                  icon={DollarSign}
                  label="Shipping Cost"
                  value={`$${shipment.cost.toLocaleString()}`}
                />
                <DetailItem
                  icon={Calendar}
                  label="Created"
                  value={new Date(shipment.createdAt).toLocaleDateString()}
                />
                <DetailItem
                  icon={Clock}
                  label="Est. Delivery"
                  value={new Date(shipment.estimatedDelivery).toLocaleDateString()}
                />
                {shipment.actualDelivery && (
                  <DetailItem
                    icon={CheckCircle2}
                    label="Delivered"
                    value={new Date(shipment.actualDelivery).toLocaleDateString()}
                    highlight
                  />
                )}
              </div>

              {/* Parties Section */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Parties
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-muted/30 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Building className="h-4 w-4" />
                      <span className="text-xs font-medium uppercase">Shipper</span>
                    </div>
                    <p className="font-medium">{shipment.shipper}</p>
                  </div>
                  <div className="rounded-xl bg-muted/30 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <User className="h-4 w-4" />
                      <span className="text-xs font-medium uppercase">Consignee</span>
                    </div>
                    <p className="font-medium">{shipment.consignee}</p>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              {shipment.notes && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                    Notes
                  </h3>
                  <div className="rounded-xl bg-muted/30 p-4">
                    <div className="flex items-start gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <p className="text-sm">{shipment.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="border-t border-border p-4 flex gap-3 justify-end">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button className="gradient-primary text-primary-foreground">
                Track Shipment
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${highlight ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`font-medium ${highlight ? 'text-success' : ''}`}>{value}</p>
      </div>
    </div>
  );
}
