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
import type { Customer } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  name: z.string().min(1, 'Il nome è obbligatorio.'),
  email: z.string().email('Email non valida.'),
  phone: z.string().min(1, 'Il numero di telefono è obbligatorio.'),
  preferences: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof formSchema>;

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Omit<Customer, 'id' | 'lastVisit' | 'avatarUrl'> & { id?: string }) => void;
  customer?: Customer;
}

export function CustomerForm({
  isOpen,
  onClose,
  onSave,
  customer,
}: CustomerFormProps) {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      preferences: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (customer) {
        form.reset({
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          preferences: customer.preferences || '',
        });
      } else {
        form.reset({
          name: '',
          email: '',
          phone: '',
          preferences: '',
        });
      }
    }
  }, [customer, form, isOpen]);

  const onSubmit = (data: CustomerFormValues) => {
    onSave({
      id: customer?.id,
      ...data,
    });
  };

  const { isSubmitting } = form.formState;
  const title = customer ? 'Modifica Cliente' : 'Nuovo Cliente';
  const description = customer
    ? 'Modifica i dettagli del cliente.'
    : 'Aggiungi un nuovo cliente alla tua lista.';

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
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Es: Mario Rossi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Es: mario.rossi@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefono</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="Es: +39 333 1234567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="preferences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferenze e Note</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Eventuali preferenze o allergie del cliente..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Annulla
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salva Cliente
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
