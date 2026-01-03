import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, AlertTriangle } from 'lucide-react';
import { graphqlRequest, DELETE_SHIPMENT_MUTATION } from '@/lib/graphql';
import { useToast } from '@/hooks/use-toast';
import { Shipment } from '@/types/shipment';

interface DeleteShipmentDialogProps {
  shipment: Shipment | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteShipmentDialog({ shipment, isOpen, onClose, onSuccess }: DeleteShipmentDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!shipment) return;

    setIsDeleting(true);
    try {
      await graphqlRequest(DELETE_SHIPMENT_MUTATION, { id: shipment.id });

      toast({
        title: 'Shipment Deleted',
        description: `Shipment ${shipment.trackingNumber} has been permanently deleted.`,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error deleting shipment:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete shipment',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Shipment
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to delete this shipment? This action cannot be undone.
            </p>
            {shipment && (
              <div className="rounded-lg border border-border bg-muted/50 p-3 mt-3">
                <p className="font-mono text-sm text-foreground">{shipment.trackingNumber}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {shipment.origin} → {shipment.destination}
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Shipment'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
