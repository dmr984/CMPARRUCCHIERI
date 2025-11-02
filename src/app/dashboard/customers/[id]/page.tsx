import { getCustomerById, getAppointments, getServices, getStaff } from '@/lib/data';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Edit, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = await getCustomerById(params.id);
  
  if (!customer) {
    notFound();
  }

  const allAppointments = await getAppointments();
  const allServices = await getServices();
  const allStaff = await getStaff();

  const customerAppointments = allAppointments
    .filter(app => app.customerId === customer.id)
    .map(app => ({
      ...app,
      service: allServices.find(s => s.id === app.serviceId),
      staff: allStaff.find(st => st.id === app.staffId)
    }))
    .sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime());

  return (
    <div>
      <PageHeader title="Dettagli Cliente">
        <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" asChild>
                <Link href="/dashboard/customers">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Torna ai Clienti
                </Link>
            </Button>
            <Button>
                <Edit className="mr-2 h-4 w-4" />
                Modifica Cliente
            </Button>
        </div>
      </PageHeader>
      
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-8">
            <Card>
                <CardContent className="pt-6 flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src={customer.avatarUrl} alt={customer.name} />
                        <AvatarFallback>{customer.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <h2 className="text-2xl font-bold">{customer.name}</h2>
                    <div className="mt-4 flex flex-col gap-2 w-full">
                        <Button variant="outline" asChild className="justify-start">
                            <a href={`mailto:${customer.email}`} className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{customer.email}</span>
                            </a>
                        </Button>
                        <Button variant="outline" asChild className="justify-start">
                            <a href={`tel:${customer.phone}`} className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{customer.phone}</span>
                            </a>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Preferenze e Note</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        {customer.preferences || 'Nessuna preferenza o nota registrata per questo cliente.'}
                    </p>
                </CardContent>
            </Card>
        </div>
        
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Storico Servizi</CardTitle>
                    <CardDescription>Un registro completo di tutti i servizi forniti a {customer.name}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Servizio</TableHead>
                                <TableHead>Stilista</TableHead>
                                <TableHead>Prezzo</TableHead>
                                <TableHead>Stato</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customerAppointments.map(app => (
                                <TableRow key={app.id}>
                                    <TableCell>{format(app.dateTime, 'PPP', { locale: it })}</TableCell>
                                    <TableCell>{app.service?.name}</TableCell>
                                    <TableCell>{app.staff?.name}</TableCell>
                                    <TableCell>€{app.service?.price.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge variant={app.status === 'Completato' ? 'secondary' : 'default'}>{app.status}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                             {customerAppointments.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                    Nessuno storico servizi trovato.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
