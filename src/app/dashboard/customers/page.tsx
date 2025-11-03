'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getCustomers, saveCustomer, deleteCustomer } from '@/lib/data';
import { MoreVertical, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import type { Customer } from '@/lib/types';
import { CustomerForm } from './_components/customer-form';
import { useToast } from '@/hooks/use-toast';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
        setCustomers(await getCustomers());
    } catch (error) {
        console.error("Failed to fetch customers:", error);
        toast({
            title: "Errore",
            description: "Impossibile caricare i clienti. Assicurati che la configurazione di Firebase sia corretta.",
            variant: "destructive"
        })
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleNewCustomer = () => {
    setEditingCustomer(undefined);
    setIsFormOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  const handleDeleteCustomer = async (customerId: string) => {
    try {
        await deleteCustomer(customerId);
        toast({
            title: "Cliente Eliminato",
            description: "Il cliente è stato eliminato con successo.",
            variant: "destructive"
        });
        fetchData();
        setIsFormOpen(false);
        setEditingCustomer(undefined);
    } catch (error) {
        console.error("Failed to delete customer:", error);
        toast({
            title: "Errore",
            description: "Impossibile eliminare il cliente.",
            variant: "destructive"
        })
    }
  }

  const handleFormSave = async (customerData: Omit<Customer, 'id' | 'lastVisit' | 'avatarUrl'> & { id?: string }) => {
    try {
        await saveCustomer(customerData);
        toast({
            title: "Cliente Salvato",
            description: "Il cliente è stato salvato con successo."
        });
        fetchData();
        setIsFormOpen(false);
        setEditingCustomer(undefined);
    } catch (error) {
        console.error("Failed to save customer:", error);
        toast({
            title: "Errore",
            description: "Impossibile salvare il cliente.",
            variant: "destructive"
        })
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingCustomer(undefined);
  };

  return (
    <div>
      <PageHeader
        title="Clienti"
        description="Visualizza e gestisci la tua lista clienti."
      >
        <Button onClick={handleNewCustomer}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Aggiungi Cliente
        </Button>
      </PageHeader>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contatto</TableHead>
                <TableHead>Ultima Visita</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage
                          src={customer.avatarUrl}
                          alt={customer.name}
                        />
                        <AvatarFallback>
                          {customer.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{customer.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{customer.email}</div>
                    <div className="text-muted-foreground text-sm">
                      {customer.phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(customer.lastVisit), 'PPP', { locale: it })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Azioni</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/customers/${customer.id}`}>
                            Vedi Dettagli
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditCustomer(customer)}
                        >
                          Modifica
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onClick={() => handleDeleteCustomer(customer.id)}
                            className="text-destructive">
                          Elimina
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <CustomerForm
        isOpen={isFormOpen}
        onClose={handleFormCancel}
        onSave={handleFormSave}
        onDelete={handleDeleteCustomer}
        customer={editingCustomer}
      />
    </div>
  );
}
