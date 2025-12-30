export type ShipmentStatus = 'pending' | 'in_transit' | 'delivered' | 'delayed' | 'cancelled';

export interface Shipment {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  carrier: string;
  weight: number;
  estimatedDelivery: string;
  actualDelivery?: string;
  shipper: string;
  consignee: string;
  createdAt: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'ground' | 'air' | 'ocean' | 'rail';
  cost: number;
  notes?: string;
}

export interface ShipmentFilters {
  status?: ShipmentStatus;
  carrier?: string;
  priority?: string;
  type?: string;
  search?: string;
}
