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


export default async function DashboardPage() {
  const appointments = await getAppointments();
  const customers = await getCustomers();
  const services = await getServices();
  const products = await getProducts();

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
      <PageHeader title="Dashboard" description="Welcome back, Carmelinda!" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Appointments
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              scheduled for today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">managed in the system</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Services Offered</CardTitle>
            <Scissors className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length}</div>
            <p className="text-xs text-muted-foreground">
              available in the catalog
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">
              need reordering
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <DashboardCharts weeklyAppointmentsData={weeklyAppointmentsData} />

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>
              These are your next scheduled appointments for today.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayAppointments.slice(0, 4).map((app) => {
                  const customer = customers.find(
                    (c) => c.id === app.customerId
                  );
                  const service = services.find(
                    (s) => s.id === app.serviceId
                  );
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
                        <Badge variant="secondary">{service?.name}</Badge>
                      </TableCell>
                      <TableCell>{format(app.dateTime, 'HH:mm')}</TableCell>
                    </TableRow>
                  );
                })}
                 {todayAppointments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      No appointments scheduled for today.
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
