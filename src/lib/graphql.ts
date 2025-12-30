import { supabase } from '@/integrations/supabase/client';

const GRAPHQL_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/graphql`;

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export async function graphqlRequest<T>(
  query: string,
  variables: Record<string, any> = {}
): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
    },
    body: JSON.stringify({ query, variables }),
  });

  const result: GraphQLResponse<T> = await response.json();

  if (result.errors?.length) {
    throw new Error(result.errors[0].message);
  }

  return result.data as T;
}

// Shipment queries
export const SHIPMENTS_QUERY = `
  query GetShipments($filter: ShipmentFilterInput, $sort: ShipmentSortInput, $page: Int, $limit: Int) {
    shipments(filter: $filter, sort: $sort, page: $page, limit: $limit) {
      edges {
        id
        trackingNumber
        origin
        destination
        status
        carrier
        weight
        estimatedDelivery
        actualDelivery
        shipper
        consignee
        priority
        type
        cost
        notes
        createdAt
        updatedAt
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        totalCount
        totalPages
        currentPage
      }
    }
  }
`;

export const SHIPMENT_QUERY = `
  query GetShipment($id: ID!) {
    shipment(id: $id) {
      id
      trackingNumber
      origin
      destination
      status
      carrier
      weight
      estimatedDelivery
      actualDelivery
      shipper
      consignee
      priority
      type
      cost
      notes
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_SHIPMENT_MUTATION = `
  mutation CreateShipment($input: CreateShipmentInput!) {
    createShipment(input: $input) {
      id
      trackingNumber
      origin
      destination
      status
      carrier
      weight
      estimatedDelivery
      shipper
      consignee
      priority
      type
      cost
      notes
      createdAt
    }
  }
`;

export const UPDATE_SHIPMENT_MUTATION = `
  mutation UpdateShipment($id: ID!, $input: UpdateShipmentInput!) {
    updateShipment(id: $id, input: $input) {
      id
      trackingNumber
      origin
      destination
      status
      carrier
      weight
      estimatedDelivery
      actualDelivery
      shipper
      consignee
      priority
      type
      cost
      notes
      updatedAt
    }
  }
`;

export const DELETE_SHIPMENT_MUTATION = `
  mutation DeleteShipment($id: ID!) {
    deleteShipment(id: $id)
  }
`;

export const ME_QUERY = `
  query Me {
    me {
      id
      email
      fullName
      avatarUrl
    }
  }
`;

export const MY_ROLE_QUERY = `
  query MyRole {
    myRole {
      id
      userId
      role
    }
  }
`;
