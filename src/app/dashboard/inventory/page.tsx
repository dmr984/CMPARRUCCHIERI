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
import { MoreVertical, PlusCircle, Minus, Plus, Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { Product } from '@/lib/types';
import { ProductForm } from './_components/product-form';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase/provider';
import { Input } from '@/components/ui/input';

type EditableProduct = Product & { editStock?: number };

export default function InventoryPage() {
  const { db, isConfigured } = useFirebase();
  const [products, setProducts] = useState<EditableProduct[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    if (!isConfigured || !db) return;
    try {
      const fetchedProducts = await getProducts(db);
      setProducts(fetchedProducts.map(p => ({...p, editStock: p.stock })));
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
  
  useEffect(() => {
    setProducts(prevProducts => prevProducts.map(p => ({ ...p, editStock: p.stock })));
  }, [products.length]);


  const handleNewProduct = () => {
    setEditingProduct(undefined);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (!db) return;
    deleteProduct(db, productId);
    toast({
        title: "Prodotto Eliminato",
        description: "Il prodotto è stato eliminato con successo.",
        variant: "destructive",
    });
    setTimeout(() => fetchData(), 1000);
    setIsFormOpen(false);
    setEditingProduct(undefined);
  };

  const handleFormSave = (productData: Omit<Product, 'id'> & { id?: string }) => {
    if (!db) return;
    saveProduct(db, productData);
    toast({
        title: "Salvataggio in corso...",
        description: "Il prodotto è in fase di salvataggio.",
    });
    setTimeout(() => fetchData(), 1000);
    setIsFormOpen(false);
    setEditingProduct(undefined);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingProduct(undefined);
  };
  
  const handleStockValueChange = (productId: string, value: number) => {
    setProducts(products.map(p => p.id === productId ? { ...p, editStock: Math.max(0, value) } : p));
  };
  
  const handleSaveStock = (product: EditableProduct) => {
    if (!db || product.editStock === undefined || product.stock === product.editStock) return;
    
    const { editStock, ...productToSave } = product;
    const updatedProduct = { ...productToSave, stock: product.editStock };

    saveProduct(db, updatedProduct);
    
    setProducts(products.map(p => p.id === product.id ? { ...p, stock: product.editStock || 0 } : p));

    toast({
        title: "Stock Aggiornato",
        description: `Lo stock di "${product.name}" è stato aggiornato a ${product.editStock}.`,
    });
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
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Prodotto</TableHead>
                <TableHead>Livello Stock</TableHead>
                <TableHead className="hidden sm:table-cell">Stato</TableHead>
                <TableHead>Prezzo</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const stockPercentage = (product.stock / (product.reorderLevel * 2)) * 100;
                const isLowStock = product.stock <= product.reorderLevel;
                const isStockDirty = product.stock !== product.editStock;

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
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleStockValueChange(product.id, (product.editStock || 0) - 1)}>
                            <Minus className="h-4 w-4" />
                        </Button>
                        <Input 
                            type="number"
                            className="w-16 h-8 text-center"
                            value={product.editStock}
                            onChange={(e) => handleStockValueChange(product.id, parseInt(e.target.value, 10))}
                        />
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleStockValueChange(product.id, (product.editStock || 0) + 1)}>
                            <Plus className="h-4 w-4" />
                        </Button>
                        {isStockDirty && (
                            <Button variant="outline" size="icon" className="h-7 w-7 text-green-600" onClick={() => handleSaveStock(product)}>
                                <Check className="h-4 w-4" />
                            </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className='flex items-center gap-2'>
                        <Progress value={stockPercentage} className="w-20 h-2 hidden md:block" />
                        <Badge variant={isLowStock ? 'destructive' : 'secondary'}>
                          {isLowStock ? 'Stock Basso' : 'In Stock'}
                        </Badge>
                      </div>
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
