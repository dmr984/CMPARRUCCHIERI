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
import { MoreVertical, PlusCircle, Import } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import type { Customer } from '@/lib/types';
import { CustomerForm, type ImportedContact } from './_components/customer-form';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase/provider';

export default function CustomersPage() {
  const { db, isConfigured } = useFirebase();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined);
  const [importedContact, setImportedContact] = useState<ImportedContact | null>(null);
  const { toast } = useToast();
  const [isInIframe, setIsInIframe] = useState(true);

  useEffect(() => {
    // This effect runs only on the client
    setIsInIframe(window.self !== window.top);
  }, []);

  const fetchData = useCallback(async () => {
    if (!isConfigured || !db) return;
    try {
        setCustomers(await getCustomers(db));
    } catch (error) {
        console.error("Failed to fetch customers:", error);
        toast({
            title: "Errore",
            description: "Impossibile caricare i clienti. Assicurati che la configurazione di Firebase sia corretta.",
            variant: "destructive"
        })
    }
  }, [toast, db, isConfigured]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleNewCustomer = () => {
    setEditingCustomer(undefined);
    setImportedContact(null);
    setIsFormOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setImportedContact(null);
    setIsFormOpen(true);
  };
  
  const handleImportContact = async () => {
    if (isInIframe) {
        toast({
            title: "Funzione non disponibile in anteprima",
            description: "L'importazione dei contatti è disponibile solo nell'applicazione distribuita, non nell'ambiente di sviluppo.",
            variant: "destructive",
        });
        return;
    }

    if (!('contacts' in navigator && 'select' in (navigator as any).contacts)) {
        toast({
            title: "Funzione non supportata",
            description: "L'importazione dei contatti è disponibile solo su browser mobili supportati (es. Chrome su Android).",
            variant: "destructive",
        });
        return;
    }

    try {
        const contacts = await (navigator as any).contacts.select(['name', 'email', 'tel'], { multiple: false });
        if (contacts.length > 0) {
            const contact = contacts[0];
            const imported: ImportedContact = {
                name: contact.name?.[0] || '',
                email: contact.email?.[0] || '',
                phone: contact.tel?.[0] || '',
            };
            setImportedContact(imported);
            setEditingCustomer(undefined);
            setIsFormOpen(true);
        }
    } catch (ex) {
        console.error("Errore durante l'importazione del contatto:", ex);
        toast({
            title: "Importazione annullata",
            description: "Non è stato selezionato nessun contatto o si è verificato un errore.",
            variant: "destructive"
        });
    }
  };

  const handleDeleteCustomer = (customerId: string) => {
    if (!db) return;
    deleteCustomer(db, customerId);
    toast({
        title: "Cliente Eliminato",
        description: "Il cliente è stato eliminato con successo.",
        variant: "destructive"
    });
    setTimeout(() => fetchData(), 1000);
    setIsFormOpen(false);
    setEditingCustomer(undefined);
  }

  const handleFormSave = (customerData: Omit<Customer, 'id' | 'lastVisit' | 'avatarUrl'> & { id?: string }) => {
    if (!db) return;
    saveCustomer(db, customerData);
    toast({
        title: "Salvataggio in corso...",
        description: "I dati del cliente sono in fase di salvataggio."
    });
    setTimeout(() => fetchData(), 1000);
    setIsFormOpen(false);
    setEditingCustomer(undefined);
    setImportedContact(null);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingCustomer(undefined);
    setImportedContact(null);
  };

  return (
    <div>
      <PageHeader
        title="Clienti"
        description="Visualizza e gestisci la tua lista clienti."
      >
        <div className='flex flex-col sm:flex-row gap-2'>
            <Button onClick={handleImportContact} variant="outline" size="sm">
                <Import className="mr-2 h-4 w-4" />
                Importa
            </Button>
            <Button onClick={handleNewCustomer} disabled={!isConfigured} size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Aggiungi
            </Button>
        </div>
      </PageHeader>
      <Card>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">Contatto</TableHead>
                <TableHead className="hidden sm:table-cell">Ultima Visita</TableHead>
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
                      <div className="font-medium whitespace-nowrap">{customer.name}</div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div>{customer.email}</div>
                    <div className="text-muted-foreground text-sm">
                      {customer.phone}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
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
      {isFormOpen && (
        <CustomerForm
            isOpen={isFormOpen}
            onClose={handleFormCancel}
            onSave={handleFormSave}
            onDelete={handleDeleteCustomer}
            customer={editingCustomer}
            importedContact={importedContact}
        />
      )}
    </div>
  );
}
