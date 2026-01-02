export type ShipmentStatus = 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'delayed' | 'cancelled';
export type ShipmentPriority = 'low' | 'medium' | 'high' | 'critical';
export type ShipmentType = 'standard' | 'express' | 'overnight' | 'freight' | 'ltl';

export interface Shipment {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  carrier: string;
  weight?: number;
  dimensions?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  shipper?: string;
  consignee?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  createdAt: string;
  updatedAt?: string;
  priority: ShipmentPriority;
  type: ShipmentType;
  cost?: number;
  notes?: string;
}

export interface ShipmentFilters {
  status?: ShipmentStatus;
  carrier?: string;
  priority?: string;
  type?: string;
  search?: string;
}
