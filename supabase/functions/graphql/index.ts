import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// GraphQL Schema Definition
const typeDefs = `
  enum ShipmentStatus {
    pending
    picked_up
    in_transit
    out_for_delivery
    delivered
    delayed
    cancelled
  }

  enum ShipmentPriority {
    low
    medium
    high
    critical
  }

  enum ShipmentType {
    standard
    express
    overnight
    freight
    ltl
  }

  enum AppRole {
    admin
    employee
  }

  type Shipment {
    id: ID!
    trackingNumber: String!
    origin: String!
    destination: String!
    status: ShipmentStatus!
    carrier: String!
    weight: Float
    dimensions: String
    estimatedDelivery: String
    actualDelivery: String
    shipper: String
    consignee: String
    customerName: String
    customerEmail: String
    customerPhone: String
    priority: ShipmentPriority!
    type: ShipmentType!
    cost: Float
    notes: String
    createdBy: ID
    createdAt: String!
    updatedAt: String!
  }
  }

  type Profile {
    id: ID!
    email: String
    fullName: String
    avatarUrl: String
    createdAt: String!
    updatedAt: String!
  }

  type UserRole {
    id: ID!
    userId: ID!
    role: AppRole!
    createdAt: String!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    totalCount: Int!
    totalPages: Int!
    currentPage: Int!
  }

  type ShipmentConnection {
    edges: [Shipment!]!
    pageInfo: PageInfo!
  }

  input ShipmentFilterInput {
    status: ShipmentStatus
    carrier: String
    priority: ShipmentPriority
    type: ShipmentType
    search: String
  }

  input ShipmentSortInput {
    field: String!
    direction: String!
  }

  input CreateShipmentInput {
    origin: String!
    destination: String!
    carrier: String!
    weight: Float!
    estimatedDelivery: String!
    shipper: String!
    consignee: String!
    priority: ShipmentPriority
    type: ShipmentType
    cost: Float!
    notes: String
  }

  input UpdateShipmentInput {
    origin: String
    destination: String
    status: ShipmentStatus
    carrier: String
    weight: Float
    estimatedDelivery: String
    actualDelivery: String
    shipper: String
    consignee: String
    priority: ShipmentPriority
    type: ShipmentType
    cost: Float
    notes: String
  }

  type Query {
    shipments(
      filter: ShipmentFilterInput
      sort: ShipmentSortInput
      page: Int
      limit: Int
    ): ShipmentConnection!
    
    shipment(id: ID!): Shipment
    
    me: Profile
    
    myRole: UserRole
  }

  type Mutation {
    createShipment(input: CreateShipmentInput!): Shipment!
    updateShipment(id: ID!, input: UpdateShipmentInput!): Shipment!
    deleteShipment(id: ID!): Boolean!
  }
`;

// Helper to parse GraphQL query
function parseGraphQLQuery(query: string): { operationType: string; operationName: string; variables: any } {
  const operationMatch = query.match(/(query|mutation)\s+(\w+)?/);
  const operationType = operationMatch?.[1] || 'query';
  const operationName = operationMatch?.[2] || '';
  return { operationType, operationName, variables: {} };
}

// Resolver functions
async function resolveShipments(
  supabase: any,
  filter: any = {},
  sort: any = { field: 'created_at', direction: 'desc' },
  page: number = 1,
  limit: number = 10
) {
  console.log('Resolving shipments with filter:', filter, 'sort:', sort, 'page:', page, 'limit:', limit);
  
  let query = supabase.from('shipments').select('*', { count: 'exact' });
  
  // Apply filters
  if (filter?.status) {
    query = query.eq('status', filter.status);
  }
  if (filter?.carrier) {
    query = query.eq('carrier', filter.carrier);
  }
  if (filter?.priority) {
    query = query.eq('priority', filter.priority);
  }
  if (filter?.type) {
    query = query.eq('type', filter.type);
  }
  if (filter?.search) {
    query = query.or(`tracking_number.ilike.%${filter.search}%,origin.ilike.%${filter.search}%,destination.ilike.%${filter.search}%,shipper.ilike.%${filter.search}%,consignee.ilike.%${filter.search}%`);
  }
  
  // Apply sorting
  const sortField = sort?.field ? toSnakeCase(sort.field) : 'created_at';
  const sortDir = sort?.direction === 'asc' ? true : false;
  query = query.order(sortField, { ascending: sortDir });
  
  // Apply pagination
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);
  
  const { data, error, count } = await query;
  
  if (error) {
    console.error('Error fetching shipments:', error);
    throw new Error(error.message);
  }
  
  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / limit);
  
  return {
    edges: data?.map(transformShipment) || [],
    pageInfo: {
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      totalCount,
      totalPages,
      currentPage: page,
    },
  };
}

async function resolveShipment(supabase: any, id: string) {
  console.log('Resolving shipment:', id);
  
  const { data, error } = await supabase
    .from('shipments')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching shipment:', error);
    throw new Error(error.message);
  }
  
  return data ? transformShipment(data) : null;
}

async function resolveMe(supabase: any, userId: string) {
  console.log('Resolving profile for user:', userId);
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching profile:', error);
    throw new Error(error.message);
  }
  
  return data ? transformProfile(data) : null;
}

async function resolveMyRole(supabase: any, userId: string) {
  console.log('Resolving role for user:', userId);
  
  const { data, error } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching role:', error);
    throw new Error(error.message);
  }
  
  return data ? transformUserRole(data) : null;
}

async function createShipment(supabase: any, input: any, userId: string) {
  console.log('Creating shipment:', input);
  
  // Generate tracking number
  const trackingNumber = `TMS-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
  
  const { data, error } = await supabase
    .from('shipments')
    .insert({
      tracking_number: trackingNumber,
      origin: input.origin,
      destination: input.destination,
      carrier: input.carrier,
      weight: input.weight,
      estimated_delivery: input.estimatedDelivery,
      shipper: input.shipper,
      consignee: input.consignee,
      priority: input.priority || 'medium',
      type: input.type || 'ground',
      cost: input.cost,
      notes: input.notes,
      created_by: userId,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating shipment:', error);
    throw new Error(error.message);
  }
  
  return transformShipment(data);
}

async function updateShipment(supabase: any, id: string, input: any) {
  console.log('Updating shipment:', id, input);
  
  const updateData: any = {};
  if (input.origin !== undefined) updateData.origin = input.origin;
  if (input.destination !== undefined) updateData.destination = input.destination;
  if (input.status !== undefined) updateData.status = input.status;
  if (input.carrier !== undefined) updateData.carrier = input.carrier;
  if (input.weight !== undefined) updateData.weight = input.weight;
  if (input.estimatedDelivery !== undefined) updateData.estimated_delivery = input.estimatedDelivery;
  if (input.actualDelivery !== undefined) updateData.actual_delivery = input.actualDelivery;
  if (input.shipper !== undefined) updateData.shipper = input.shipper;
  if (input.consignee !== undefined) updateData.consignee = input.consignee;
  if (input.priority !== undefined) updateData.priority = input.priority;
  if (input.type !== undefined) updateData.type = input.type;
  if (input.cost !== undefined) updateData.cost = input.cost;
  if (input.notes !== undefined) updateData.notes = input.notes;
  
  const { data, error } = await supabase
    .from('shipments')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating shipment:', error);
    throw new Error(error.message);
  }
  
  return transformShipment(data);
}

async function deleteShipment(supabase: any, id: string) {
  console.log('Deleting shipment:', id);
  
  const { error } = await supabase
    .from('shipments')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting shipment:', error);
    throw new Error(error.message);
  }
  
  return true;
}

// Transform functions (snake_case to camelCase)
function transformShipment(data: any) {
  return {
    id: data.id,
    trackingNumber: data.tracking_number,
    origin: data.origin,
    destination: data.destination,
    status: data.status,
    carrier: data.carrier,
    weight: data.weight,
    dimensions: data.dimensions,
    estimatedDelivery: data.estimated_delivery,
    actualDelivery: data.actual_delivery,
    shipper: data.shipper || data.customer_name,
    consignee: data.consignee || data.customer_name,
    customerName: data.customer_name,
    customerEmail: data.customer_email,
    customerPhone: data.customer_phone,
    priority: data.priority,
    type: data.type,
    cost: data.cost,
    notes: data.notes,
    createdBy: data.created_by,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function transformProfile(data: any) {
  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    avatarUrl: data.avatar_url,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function transformUserRole(data: any) {
  return {
    id: data.id,
    userId: data.user_id,
    role: data.role,
    createdAt: data.created_at,
  };
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

// Check if user has admin role
async function checkAdminRole(supabase: any, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .maybeSingle();
  
  if (error) {
    console.error('Error checking admin role:', error);
    return false;
  }
  
  return !!data;
}

// Simple GraphQL query parser
function extractOperation(query: string): { type: string; name: string; args: any } {
  // Check for mutation
  if (query.includes('createShipment')) {
    return { type: 'mutation', name: 'createShipment', args: {} };
  }
  if (query.includes('updateShipment')) {
    return { type: 'mutation', name: 'updateShipment', args: {} };
  }
  if (query.includes('deleteShipment')) {
    return { type: 'mutation', name: 'deleteShipment', args: {} };
  }
  
  // Check for queries
  if (query.includes('shipments')) {
    return { type: 'query', name: 'shipments', args: {} };
  }
  if (query.includes('shipment(')) {
    return { type: 'query', name: 'shipment', args: {} };
  }
  if (query.includes('myRole')) {
    return { type: 'query', name: 'myRole', args: {} };
  }
  if (query.includes('me')) {
    return { type: 'query', name: 'me', args: {} };
  }
  
  return { type: 'query', name: 'unknown', args: {} };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    
    // Create Supabase client with the user's auth token if available
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    });

    // Verify user authentication
    let userId: string | null = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error) {
        console.error('Auth error:', error);
      } else {
        userId = user?.id || null;
      }
    }

    const { query, variables = {} } = await req.json();
    console.log('GraphQL Query:', query);
    console.log('Variables:', variables);
    console.log('User ID:', userId);

    const operation = extractOperation(query);
    console.log('Operation:', operation);

    let result: any = null;

    // Handle mutations (require admin role)
    if (operation.type === 'mutation') {
      if (!userId) {
        return new Response(
          JSON.stringify({ errors: [{ message: 'Authentication required' }] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }

      const isAdmin = await checkAdminRole(supabase, userId);
      if (!isAdmin) {
        return new Response(
          JSON.stringify({ errors: [{ message: 'Admin role required for this operation' }] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }

      switch (operation.name) {
        case 'createShipment':
          result = { createShipment: await createShipment(supabase, variables.input, userId) };
          break;
        case 'updateShipment':
          result = { updateShipment: await updateShipment(supabase, variables.id, variables.input) };
          break;
        case 'deleteShipment':
          result = { deleteShipment: await deleteShipment(supabase, variables.id) };
          break;
      }
    } else {
      // Handle queries (require authentication)
      if (!userId && operation.name !== 'unknown') {
        return new Response(
          JSON.stringify({ errors: [{ message: 'Authentication required' }] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }

      switch (operation.name) {
        case 'shipments':
          result = { 
            shipments: await resolveShipments(
              supabase, 
              variables.filter, 
              variables.sort,
              variables.page || 1,
              variables.limit || 10
            ) 
          };
          break;
        case 'shipment':
          result = { shipment: await resolveShipment(supabase, variables.id) };
          break;
        case 'me':
          result = { me: await resolveMe(supabase, userId!) };
          break;
        case 'myRole':
          result = { myRole: await resolveMyRole(supabase, userId!) };
          break;
        default:
          result = { 
            schema: typeDefs,
            message: 'GraphQL API ready. Send a valid query or mutation.' 
          };
      }
    }

    return new Response(
      JSON.stringify({ data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('GraphQL Error:', error);
    return new Response(
      JSON.stringify({ errors: [{ message: errorMessage }] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
