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
import type { Product } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(1, 'Il nome è obbligatorio.'),
  category: z.string().min(1, 'La categoria è obbligatoria.'),
  supplier: z.string().min(1, 'Il fornitore è obbligatorio.'),
  stock: z.coerce.number().int().nonnegative('Lo stock non può essere negativo.'),
  reorderLevel: z.coerce.number().int().nonnegative('Il livello di riordino non può essere negativo.'),
  price: z.coerce.number().positive('Il prezzo deve essere un numero positivo.'),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'> & { id?: string }) => void;
  onDelete: (productId: string) => void;
  product?: Product;
}

export function ProductForm({
  isOpen,
  onClose,
  onSave,
  onDelete,
  product,
}: ProductFormProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      category: '',
      supplier: '',
      stock: 0,
      reorderLevel: 0,
      price: 0,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (product) {
        form.reset({
          name: product.name,
          category: product.category,
          supplier: product.supplier,
          stock: product.stock,
          reorderLevel: product.reorderLevel,
          price: product.price,
        });
      } else {
        form.reset({
          name: '',
          category: '',
          supplier: '',
          stock: 10,
          reorderLevel: 5,
          price: 10,
        });
      }
    }
  }, [product, form, isOpen]);

  const onSubmit = (data: ProductFormValues) => {
    onSave({
      id: product?.id,
      ...data,
    });
  };

  const handleDelete = () => {
    if (product) {
        onDelete(product.id);
    }
  };

  const { isSubmitting } = form.formState;
  const title = product ? 'Modifica Prodotto' : 'Nuovo Prodotto';
  const description = product
    ? 'Modifica i dettagli del prodotto.'
    : 'Aggiungi un nuovo articolo al tuo inventario.';

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
                  <FormLabel>Nome Prodotto</FormLabel>
                  <FormControl>
                    <Input placeholder="Es: Shampoo Volumizzante" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <FormControl>
                      <Input placeholder="Es: Shampoo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fornitore</FormLabel>
                    <FormControl>
                      <Input placeholder="Es: Beauty Supplies S.p.A." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Stock (unità)</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="Es: 15" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="reorderLevel"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Livello Riordino</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="Es: 10" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
             <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Prezzo (€)</FormLabel>
                    <FormControl>
                        <Input type="number" step="0.01" placeholder="Es: 18.00" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            
            <DialogFooter className="justify-between pt-4">
                <div>
                {product && (
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
                    Salva Prodotto
                </Button>
                </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
