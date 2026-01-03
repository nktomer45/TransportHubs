import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Pencil } from 'lucide-react';
import { graphqlRequest, UPDATE_SHIPMENT_MUTATION } from '@/lib/graphql';
import { useToast } from '@/hooks/use-toast';
import { carriers, priorities, shipmentTypes, statuses } from '@/data/mockShipments';
import { Shipment } from '@/types/shipment';

const editShipmentSchema = z.object({
  origin: z.string().trim().min(1, 'Origin is required').max(200),
  destination: z.string().trim().min(1, 'Destination is required').max(200),
  carrier: z.string().min(1, 'Carrier is required'),
  status: z.enum(['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'delayed', 'cancelled']),
  weight: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  dimensions: z.string().max(50).optional(),
  estimatedDelivery: z.string().optional(),
  actualDelivery: z.string().optional(),
  customerName: z.string().trim().min(1, 'Customer name is required').max(100),
  customerEmail: z.string().trim().email().max(255).optional().or(z.literal('')),
  customerPhone: z.string().max(20).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  type: z.enum(['standard', 'express', 'overnight', 'freight', 'ltl']),
  cost: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  notes: z.string().max(500).optional(),
});

type EditShipmentValues = z.infer<typeof editShipmentSchema>;

interface EditShipmentFormProps {
  shipment: Shipment | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditShipmentForm({ shipment, isOpen, onClose, onSuccess }: EditShipmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<EditShipmentValues>({
    resolver: zodResolver(editShipmentSchema),
    defaultValues: {
      origin: '',
      destination: '',
      carrier: '',
      status: 'pending',
      weight: undefined,
      dimensions: '',
      estimatedDelivery: '',
      actualDelivery: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      priority: 'medium',
      type: 'standard',
      cost: undefined,
      notes: '',
    },
  });

  // Reset form when shipment changes
  useEffect(() => {
    if (shipment && isOpen) {
      form.reset({
        origin: shipment.origin,
        destination: shipment.destination,
        carrier: shipment.carrier,
        status: shipment.status,
        weight: shipment.weight?.toString() as any,
        dimensions: shipment.dimensions || '',
        estimatedDelivery: shipment.estimatedDelivery?.split('T')[0] || '',
        actualDelivery: shipment.actualDelivery?.split('T')[0] || '',
        customerName: shipment.customerName || shipment.shipper || '',
        customerEmail: shipment.customerEmail || '',
        customerPhone: shipment.customerPhone || '',
        priority: shipment.priority,
        type: shipment.type,
        cost: shipment.cost?.toString() as any,
        notes: shipment.notes || '',
      });
    }
  }, [shipment, isOpen, form]);

  const onSubmit = async (values: EditShipmentValues) => {
    if (!shipment) return;
    
    setIsSubmitting(true);
    try {
      await graphqlRequest(UPDATE_SHIPMENT_MUTATION, {
        id: shipment.id,
        input: {
          origin: values.origin,
          destination: values.destination,
          carrier: values.carrier,
          status: values.status,
          weight: values.weight,
          dimensions: values.dimensions || null,
          estimatedDelivery: values.estimatedDelivery || null,
          actualDelivery: values.actualDelivery || null,
          customerName: values.customerName,
          customerEmail: values.customerEmail || null,
          customerPhone: values.customerPhone || null,
          priority: values.priority,
          type: values.type,
          cost: values.cost,
          notes: values.notes || null,
        },
      });

      toast({
        title: 'Shipment Updated',
        description: `Shipment ${shipment.trackingNumber} has been updated.`,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating shipment:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update shipment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <Pencil className="h-5 w-5 text-primary" />
            Edit Shipment
            {shipment && (
              <span className="text-sm font-mono text-muted-foreground ml-2">
                {shipment.trackingNumber}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status} className="capitalize">
                          {status.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Origin & Destination */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="origin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origin *</FormLabel>
                    <FormControl>
                      <Input placeholder="Los Angeles, CA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination *</FormLabel>
                    <FormControl>
                      <Input placeholder="New York, NY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Carrier & Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="carrier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carrier *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select carrier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {carriers.map((carrier) => (
                          <SelectItem key={carrier} value={carrier}>
                            {carrier}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shipment Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {shipmentTypes.map((type) => (
                          <SelectItem key={type} value={type} className="capitalize">
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Priority & Delivery Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority} value={priority} className="capitalize">
                            {priority}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estimatedDelivery"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Delivery</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="actualDelivery"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actual Delivery</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Weight, Dimensions & Cost */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (lbs)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dimensions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dimensions</FormLabel>
                    <FormControl>
                      <Input placeholder="24x18x12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Customer Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional shipping instructions or notes..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gradient-primary">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
