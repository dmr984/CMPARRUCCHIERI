'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { getProducts, saveProduct, deleteProduct } from '@/lib/data';
import { MoreVertical, PlusCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { Product } from '@/lib/types';
import { ProductForm } from './_components/product-form';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase/client-provider';

export default function InventoryPage() {
  const { db, isConfigured } = useFirebase();
  const [products, setProducts] = useState<Product[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    if (!isConfigured || !db) return;
    try {
      setProducts(await getProducts(db));
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i prodotti. Assicurati che la configurazione di Firebase sia corretta.",
        variant: "destructive"
      });
    }
  }, [toast, db, isConfigured]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleNewProduct = () => {
    setEditingProduct(undefined);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!db) return;
    try {
      await deleteProduct(db, productId);
      toast({
        title: "Prodotto Eliminato",
        description: "Il prodotto è stato eliminato con successo.",
        variant: "destructive",
      });
      fetchData();
      setIsFormOpen(false);
      setEditingProduct(undefined);
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare il prodotto.",
        variant: "destructive",
      });
    }
  };

  const handleFormSave = async (productData: Omit<Product, 'id'> & { id?: string }) => {
    if (!db) return;
    try {
      await saveProduct(db, productData);
      toast({
        title: "Prodotto Salvato",
        description: "Il prodotto è stato salvato con successo.",
      });
      fetchData();
      setIsFormOpen(false);
      setEditingProduct(undefined);
    } catch (error) {
      console.error("Failed to save product:", error);
      toast({
        title: "Errore",
        description: "Impossibile salvare il prodotto.",
        variant: "destructive",
      });
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingProduct(undefined);
  };

  return (
    <div>
      <PageHeader title="Inventario" description="Traccia e gestisci lo stock dei prodotti.">
        <Button onClick={handleNewProduct} disabled={!isConfigured}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Aggiungi Prodotto
        </Button>
      </PageHeader>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Prodotto</TableHead>
                <TableHead>Livello Stock</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Prezzo</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const stockPercentage = (product.stock / (product.reorderLevel * 2)) * 100;
                const isLowStock = product.stock <= product.reorderLevel;
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {product.category}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <Progress value={stockPercentage} className="w-24 h-2" />
                        <span>{product.stock} unità</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isLowStock ? 'destructive' : 'secondary'}>
                        {isLowStock ? 'Stock Basso' : 'In Stock'}
                      </Badge>
                    </TableCell>
                    <TableCell>€{product.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Azioni</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                            Modifica Prodotto
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-destructive">
                            Elimina
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {isFormOpen && (
        <ProductForm 
            isOpen={isFormOpen}
            onClose={handleFormCancel}
            onSave={handleFormSave}
            onDelete={handleDeleteProduct}
            product={editingProduct}
        />
      )}
    </div>
  );
}
