'use client';

import { useState, useEffect } from 'react';
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
import { getProducts } from '@/lib/data';
import { MoreVertical, PlusCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { Product } from '@/lib/types';
import { ProductForm } from './_components/product-form';

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

  useEffect(() => {
    async function fetchData() {
      setProducts(await getProducts());
    }
    fetchData();
  }, []);

  const handleNewProduct = () => {
    setEditingProduct(undefined);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleFormSave = (productData: Omit<Product, 'id'> & { id?: string }) => {
    if (productData.id) {
      setProducts(
        products.map((p) =>
          p.id === productData.id ? { ...p, ...productData } as Product : p
        )
      );
    } else {
      const newId = (Math.max(0, ...products.map((p) => parseInt(p.id))) + 1).toString();
      const newProduct: Product = {
        ...productData,
        id: newId,
      };
      setProducts([...products, newProduct]);
    }
    setIsFormOpen(false);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
  };

  return (
    <div>
      <PageHeader title="Inventario" description="Traccia e gestisci lo stock dei prodotti.">
        <Button onClick={handleNewProduct}>
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
                          <DropdownMenuItem>Aggiorna Stock</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                            Modifica Prodotto
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
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
      <ProductForm 
        isOpen={isFormOpen}
        onClose={handleFormCancel}
        onSave={handleFormSave}
        product={editingProduct}
      />
    </div>
  );
}
