import { useState, useEffect, useCallback } from 'react';
import { graphqlRequest, SHIPMENTS_QUERY } from '@/lib/graphql';
import { Shipment, ShipmentFilters } from '@/types/shipment';
import { useAuth } from '@/contexts/AuthContext';

interface ShipmentConnection {
  edges: Shipment[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    totalCount: number;
    totalPages: number;
    currentPage: number;
  };
}

interface ShipmentsResponse {
  shipments: ShipmentConnection;
}

export function useShipments(filters: ShipmentFilters = {}, page = 1, limit = 50) {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageInfo, setPageInfo] = useState<ShipmentConnection['pageInfo'] | null>(null);
  const { session } = useAuth();

  const fetchShipments = useCallback(async () => {
    if (!session) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const filterInput: Record<string, string | undefined> = {};
      if (filters.status) filterInput.status = filters.status;
      if (filters.carrier) filterInput.carrier = filters.carrier;
      if (filters.priority) filterInput.priority = filters.priority;
      if (filters.type) filterInput.type = filters.type;
      if (filters.search) filterInput.search = filters.search;

      const response = await graphqlRequest<ShipmentsResponse>(SHIPMENTS_QUERY, {
        filter: Object.keys(filterInput).length > 0 ? filterInput : null,
        sort: { field: 'createdAt', direction: 'desc' },
        page,
        limit,
      });

      setShipments(response.shipments.edges);
      setPageInfo(response.shipments.pageInfo);
    } catch (err) {
      console.error('Error fetching shipments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch shipments');
    } finally {
      setLoading(false);
    }
  }, [session, filters, page, limit]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  return {
    shipments,
    loading,
    error,
    pageInfo,
    refetch: fetchShipments,
  };
}
