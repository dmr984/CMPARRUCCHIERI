import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import {
  getAppointments,
  getCustomers,
  getServices,
  getStaff,
} from '@/lib/data';
import { AppointmentsView } from './_components/appointments-view';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default async function AppointmentsPage() {
  const appointments = await getAppointments();
  const customers = await getCustomers();
  const services = await getServices();
  const staff = await getStaff();

  return (
    <div>
      <PageHeader title="Appointments" description="Manage your salon's schedule.">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Appointment
        </Button>
      </PageHeader>
      <AppointmentsView
        appointments={appointments}
        customers={customers}
        services={services}
        staff={staff}
      />
    </div>
  );
}
