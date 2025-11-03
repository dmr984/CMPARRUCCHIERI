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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Staff, StaffRole } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(1, 'Il nome è obbligatorio.'),
  role: z.enum(['Stilista', 'Manager', 'Receptionist']),
});

type StaffFormValues = z.infer<typeof formSchema>;

interface StaffFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (staffMember: Omit<Staff, 'id'> & { id?: string }) => void;
  onDelete?: (staffId: string) => void;
  staffMember?: Staff;
}

export function StaffForm({
  isOpen,
  onClose,
  onSave,
  onDelete,
  staffMember,
}: StaffFormProps) {
  const form = useForm<StaffFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      role: 'Stilista',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (staffMember) {
        form.reset({
          name: staffMember.name,
          role: staffMember.role,
        });
      } else {
        form.reset({
          name: '',
          role: 'Stilista',
        });
      }
    }
  }, [staffMember, form, isOpen]);

  const onSubmit = (data: StaffFormValues) => {
    onSave({
      id: staffMember?.id,
      ...data,
    });
  };

  const handleDelete = () => {
    if (staffMember && onDelete) {
        onDelete(staffMember.id);
    }
  };

  const { isSubmitting } = form.formState;
  const title = staffMember ? 'Modifica Stilista' : 'Nuovo Stilista';
  const description = staffMember
    ? 'Modifica i dettagli dello stilista.'
    : 'Aggiungi un nuovo membro allo staff.';

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
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Es: Beatrice" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ruolo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona un ruolo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(['Stilista', 'Manager', 'Receptionist'] as StaffRole[]).map(role => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="justify-between pt-4">
              <div>
                {staffMember && onDelete && (
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
                  Salva
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
