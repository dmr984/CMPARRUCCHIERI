'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
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
import { getServices, saveService, deleteService } from '@/lib/data';
import { MoreVertical, PlusCircle } from 'lucide-react';
import type { Service } from '@/lib/types';
import { ServiceForm } from './_components/service-form';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase/provider';

export default function ServicesPage() {
  const { db, isConfigured } = useFirebase();
  const [services, setServices] = useState<Service[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | undefined>(undefined);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    if (!isConfigured || !db) return;
    try {
      setServices(await getServices(db));
    } catch (error) {
      console.error("Failed to fetch services:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i servizi. Assicurati che la configurazione di Firebase sia corretta.",
        variant: "destructive",
      });
    }
  }, [toast, db, isConfigured]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleNewService = () => {
    setEditingService(undefined);
    setIsFormOpen(true);
  }

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setIsFormOpen(true);
  }

  const handleDeleteService = (serviceId: string) => {
    if (!db) return;
    deleteService(db, serviceId);
    toast({
        title: "Servizio Eliminato",
        description: "Il servizio è stato eliminato con successo.",
        variant: 'destructive',
    });
    setTimeout(() => fetchData(), 1000);
    setIsFormOpen(false);
    setEditingService(undefined);
  }

  const handleFormSave = (serviceData: Omit<Service, 'id'> & { id?: string }) => {
    if (!db) return;
    saveService(db, serviceData);
    toast({
        title: "Salvataggio in corso...",
        description: "Il servizio è in fase di salvataggio."
    });
    setTimeout(() => fetchData(), 1000);
    setIsFormOpen(false);
    setEditingService(undefined);
  }
  
  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingService(undefined);
  }

  return (
    <div>
      <PageHeader title="Servizi" description="Gestisci il catalogo dei servizi del tuo salone.">
        <Button onClick={handleNewService} disabled={!isConfigured}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Aggiungi Servizio
        </Button>
      </PageHeader>
      <Card>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-2/5">Servizio</TableHead>
                <TableHead>Durata</TableHead>
                <TableHead>Prezzo</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <div className="font-medium">{service.name}</div>
                    <div className="text-sm text-muted-foreground hidden sm:block">
                      {service.description}
                    </div>
                  </TableCell>
                  <TableCell>{service.duration} min</TableCell>
                  <TableCell>€{service.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Azioni</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditService(service)}>Modifica</DropdownMenuItem>
                        <DropdownMenuItem 
                            onClick={() => handleDeleteService(service.id)}
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
        <ServiceForm 
            isOpen={isFormOpen}
            onClose={handleFormCancel}
            onSave={handleFormSave}
            onDelete={handleDeleteService}
            service={editingService}
        />
      )}
    </div>
  );
}
