import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { ShipmentGrid } from '@/components/shipments/ShipmentGrid';
import { ShipmentTileView } from '@/components/shipments/ShipmentTileView';
import { ShipmentDetailModal } from '@/components/shipments/ShipmentDetailModal';
import { mockShipments, carriers, statuses, priorities, shipmentTypes } from '@/data/mockShipments';
import { Shipment, ShipmentFilters } from '@/types/shipment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  LayoutGrid, 
  List, 
  Plus, 
  Search, 
  SlidersHorizontal,
  Package,
  Truck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Index() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'tile'>('tile');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [filters, setFilters] = useState<ShipmentFilters>({});
  const { toast } = useToast();

  // Filter shipments
  const filteredShipments = useMemo(() => {
    return mockShipments.filter((shipment) => {
      if (filters.status && shipment.status !== filters.status) return false;
      if (filters.carrier && shipment.carrier !== filters.carrier) return false;
      if (filters.priority && shipment.priority !== filters.priority) return false;
      if (filters.type && shipment.type !== filters.type) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          shipment.trackingNumber.toLowerCase().includes(searchLower) ||
          shipment.origin.toLowerCase().includes(searchLower) ||
          shipment.destination.toLowerCase().includes(searchLower) ||
          shipment.shipper.toLowerCase().includes(searchLower) ||
          shipment.consignee.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [filters]);

  // Stats
  const stats = useMemo(() => ({
    total: mockShipments.length,
    inTransit: mockShipments.filter(s => s.status === 'in_transit').length,
    delivered: mockShipments.filter(s => s.status === 'delivered').length,
    delayed: mockShipments.filter(s => s.status === 'delayed').length,
    pending: mockShipments.filter(s => s.status === 'pending').length,
  }), []);

  const handleSelectShipment = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setDetailModalOpen(true);
  };

  const handleEdit = (shipment: Shipment) => {
    toast({
      title: "Edit Shipment",
      description: `Opening editor for ${shipment.trackingNumber}`,
    });
  };

  const handleFlag = (shipment: Shipment) => {
    toast({
      title: "Shipment Flagged",
      description: `${shipment.trackingNumber} has been flagged for review`,
    });
  };

  const handleDelete = (shipment: Shipment) => {
    toast({
      title: "Shipment Deleted",
      description: `${shipment.trackingNumber} has been removed`,
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient */}
      <div className="fixed inset-0 gradient-glow pointer-events-none" />
      
      <Header onMenuToggle={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="relative">
        {/* Hero Stats Section */}
        <section className="border-b border-border bg-card/30">
          <div className="container py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <h1 className="font-display text-3xl font-bold mb-2">
                  Shipments
                </h1>
                <p className="text-muted-foreground">
                  Track and manage all your shipments in one place
                </p>
              </div>
              <Button className="gradient-primary text-primary-foreground shadow-glow">
                <Plus className="h-4 w-4 mr-2" />
                New Shipment
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <StatCard
                icon={Package}
                label="Total"
                value={stats.total}
                color="text-foreground"
              />
              <StatCard
                icon={Truck}
                label="In Transit"
                value={stats.inTransit}
                color="text-info"
              />
              <StatCard
                icon={CheckCircle2}
                label="Delivered"
                value={stats.delivered}
                color="text-success"
              />
              <StatCard
                icon={AlertTriangle}
                label="Delayed"
                value={stats.delayed}
                color="text-destructive"
              />
              <StatCard
                icon={XCircle}
                label="Pending"
                value={stats.pending}
                color="text-warning"
              />
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="container py-6">
          {/* Toolbar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search shipments..."
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => setFilters({ ...filters, status: value === 'all' ? undefined : value as any })}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status} className="capitalize">
                      {status.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.carrier || 'all'}
                onValueChange={(value) => setFilters({ ...filters, carrier: value === 'all' ? undefined : value })}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Carrier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Carriers</SelectItem>
                  {carriers.map((carrier) => (
                    <SelectItem key={carrier} value={carrier}>
                      {carrier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.priority || 'all'}
                onValueChange={(value) => setFilters({ ...filters, priority: value === 'all' ? undefined : value })}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  {priorities.map((priority) => (
                    <SelectItem key={priority} value={priority} className="capitalize">
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.type || 'all'}
                onValueChange={(value) => setFilters({ ...filters, type: value === 'all' ? undefined : value })}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {shipmentTypes.map((type) => (
                    <SelectItem key={type} value={type} className="capitalize">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>

              {/* View Toggle */}
              <div className="flex items-center border border-border rounded-lg overflow-hidden ml-auto">
                <Button
                  variant={viewMode === 'tile' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('tile')}
                  className="rounded-none"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Results Info */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{filteredShipments.length}</span> of{' '}
              <span className="font-medium text-foreground">{mockShipments.length}</span> shipments
            </p>
          </div>

          {/* Shipments View */}
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {viewMode === 'grid' ? (
              <ShipmentGrid
                shipments={filteredShipments}
                onSelect={handleSelectShipment}
              />
            ) : (
              <ShipmentTileView
                shipments={filteredShipments}
                onSelect={handleSelectShipment}
                onEdit={handleEdit}
                onFlag={handleFlag}
                onDelete={handleDelete}
              />
            )}
          </motion.div>
        </section>
      </main>

      {/* Detail Modal */}
      <ShipmentDetailModal
        shipment={selectedShipment}
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedShipment(null);
        }}
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold font-display">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}
