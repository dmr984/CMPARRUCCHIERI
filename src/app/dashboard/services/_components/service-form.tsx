'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { Service } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  name: z.string().min(1, 'Il nome è obbligatorio.'),
  description: z.string().min(1, 'La descrizione è obbligatoria.'),
  duration: z.coerce.number().int().positive('La durata deve essere un numero positivo.'),
  price: z.coerce.number().positive('Il prezzo deve essere un numero positivo.'),
});

type ServiceFormValues = z.infer<typeof formSchema>;

interface ServiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: Omit<Service, 'id'> & { id?: string }) => void;
  onDelete: (serviceId: string) => void;
  service?: Service;
}

export function ServiceForm({
  isOpen,
  onClose,
  onSave,
  onDelete,
  service,
}: ServiceFormProps) {
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      duration: 0,
      price: 0,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (service) {
        form.reset({
          name: service.name,
          description: service.description,
          duration: service.duration,
          price: service.price,
        });
      } else {
        form.reset({
          name: '',
          description: '',
          duration: 30,
          price: 20,
        });
      }
    }
  }, [service, form, isOpen]);

  const onSubmit = (data: ServiceFormValues) => {
    onSave({
      id: service?.id,
      ...data,
    });
  };

  const handleDelete = () => {
    if (service) {
        onDelete(service.id);
    }
  };

  const { isSubmitting } = form.formState;
  const title = service ? 'Modifica Servizio' : 'Nuovo Servizio';
  const description = service
    ? 'Modifica i dettagli del servizio.'
    : 'Aggiungi un nuovo servizio al tuo catalogo.';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Servizio</FormLabel>
                  <FormControl>
                    <Input placeholder="Es: Taglio Donna" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrizione</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Una breve descrizione del servizio..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Durata (min)</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="Es: 45" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Prezzo (€)</FormLabel>
                    <FormControl>
                        <Input type="number" step="0.01" placeholder="Es: 35.00" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            
            <DialogFooter className="justify-between">
              <div>
                {service && (
                  <Button type="button" variant="destructive" onClick={handleDelete}>
                    Elimina
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Annulla
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salva Servizio
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
