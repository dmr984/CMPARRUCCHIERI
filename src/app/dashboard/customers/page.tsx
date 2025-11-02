import Link from 'next/link';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getCustomers } from '@/lib/data';
import { MoreVertical, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <div>
      <PageHeader title="Clienti" description="Visualizza e gestisci la tua lista clienti.">
        <Button>
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
                <TableHead className='text-right'>Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={customer.avatarUrl} alt={customer.name} />
                        <AvatarFallback>{customer.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{customer.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{customer.email}</div>
                    <div className="text-muted-foreground text-sm">{customer.phone}</div>
                  </TableCell>
                  <TableCell>{format(customer.lastVisit, 'PPP', { locale: it })}</TableCell>
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
                          <Link href={`/dashboard/customers/${customer.id}`}>Vedi Dettagli</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Modifica</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Elimina</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
