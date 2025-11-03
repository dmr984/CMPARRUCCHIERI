'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  getAppointments,
  getCustomers,
  getProducts,
  getServices,
} from '@/lib/data';
import {
  Users,
  Calendar,
  Scissors,
  Package,
} from 'lucide-react';
import { format, isToday } from 'date-fns';
import { PageHeader } from '@/components/page-header';
import { DashboardCharts } from './_components/dashboard-charts';
import type { Appointment, Customer, Product, Service } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase/provider';


export default function DashboardPage() {
  const { db, isConfigured } = useFirebase();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    if (!isConfigured || !db) return;
    try {
        const [appointments, customers, services, products] = await Promise.all([
            getAppointments(db),
            getCustomers(db),
            getServices(db),
            getProducts(db)
        ]);
        setAppointments(appointments);
        setCustomers(customers);
        setServices(services);
        setProducts(products);
    } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast({
            title: "Errore",
            description: "Impossibile caricare i dati della dashboard. Assicurati che la configurazione di Firebase sia corretta.",
            variant: "destructive"
        })
    }
  }, [toast, db, isConfigured]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const todayAppointments = appointments.filter((app) => isToday(app.dateTime));
  const lowStockProducts = products.filter(
    (prod) => prod.stock <= prod.reorderLevel
  );

  const weeklyAppointmentsData = Array(7)
    .fill(0)
    .map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: format(date, 'EEE'),
        count: appointments.filter(
          (a) => format(a.dateTime, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        ).length,
      };
    });

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" description="Bentornata, Carmelinda!" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Appuntamenti di Oggi
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              programmati per oggi
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clienti Totali</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">gestiti nel sistema</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Servizi Offerti</CardTitle>
            <Scissors className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length}</div>
            <p className="text-xs text-muted-foreground">
              disponibili nel catalogo
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Articoli in Esaurimento</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">
              necessitano di riordino
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <DashboardCharts weeklyAppointmentsData={weeklyAppointmentsData} />

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Prossimi Appuntamenti</CardTitle>
            <CardDescription>
              Questi sono i tuoi prossimi appuntamenti per oggi.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Servizio</TableHead>
                  <TableHead>Ora</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayAppointments.slice(0, 4).map((app) => {
                  const customer = customers.find(
                    (c) => c.id === app.customerId
                  );
                  const appointmentServices = services.filter(s => app.serviceIds.includes(s.id));
                  return (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={customer?.avatarUrl} alt={customer?.name} />
                            <AvatarFallback>
                              {customer?.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{customer?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {appointmentServices.map(service => (
                            <Badge key={service.id} variant="secondary" className="whitespace-nowrap">
                              {service.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{format(app.dateTime, 'HH:mm')}</TableCell>
                    </TableRow>
                  );
                })}
                 {todayAppointments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      Nessun appuntamento programmato per oggi.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
