import { Shipment, ShipmentStatus, ShipmentPriority, ShipmentType } from '@/types/shipment';

// Mock data is kept as fallback, but the app now fetches from the API
export const mockShipments: Shipment[] = [];

export const carriers = ['FedEx', 'UPS', 'DHL', 'USPS', 'Maersk', 'KLM Cargo'];
export const shipmentTypes: ShipmentType[] = ['standard', 'express', 'overnight', 'freight', 'ltl'];
export const priorities: ShipmentPriority[] = ['low', 'medium', 'high', 'critical'];
export const statuses: ShipmentStatus[] = ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'delayed', 'cancelled'];
