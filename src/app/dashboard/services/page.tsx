'use client';

import { useState, useEffect } from 'react';
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
import { getServices } from '@/lib/data';
import { MoreVertical, PlusCircle } from 'lucide-react';
import type { Service } from '@/lib/types';
import { ServiceForm } from './_components/service-form';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | undefined>(undefined);

  useEffect(() => {
    async function fetchData() {
      setServices(await getServices());
    }
    fetchData();
  }, []);

  const handleNewService = () => {
    setEditingService(undefined);
    setIsFormOpen(true);
  }

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setIsFormOpen(true);
  }

  const handleFormSave = (serviceData: Omit<Service, 'id'> & { id?: string }) => {
    if (serviceData.id) {
        setServices(services.map(s => s.id === serviceData.id ? { ...s, ...serviceData } as Service : s));
    } else {
        const newId = (Math.max(0, ...services.map(s => parseInt(s.id))) + 1).toString();
        const newService = { ...serviceData, id: newId } as Service;
        setServices([...services, newService]);
    }
    setIsFormOpen(false);
  }
  
  const handleFormCancel = () => {
    setIsFormOpen(false);
  }


  return (
    <div>
      <PageHeader title="Servizi" description="Gestisci il catalogo dei servizi del tuo salone.">
        <Button onClick={handleNewService}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Aggiungi Servizio
        </Button>
      </PageHeader>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Servizio</TableHead>
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
                    <div className="text-sm text-muted-foreground">
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
                        <DropdownMenuItem className="text-destructive">
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
      <ServiceForm 
        isOpen={isFormOpen}
        onClose={handleFormCancel}
        onSave={handleFormSave}
        service={editingService}
      />
    </div>
  );
}
