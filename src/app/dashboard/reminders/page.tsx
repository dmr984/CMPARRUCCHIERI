import { getCustomers, getAppointments, getServices } from '@/lib/data';
import { ReminderForm } from './_components/reminder-form';
import { PageHeader } from '@/components/page-header';

export default async function RemindersPage() {
  const customers = await getCustomers();
  const appointments = await getAppointments();
  const services = await getServices();
  
  return (
    <div>
      <PageHeader 
        title="Promemoria AI via WhatsApp" 
        description="Genera e invia promemoria personalizzati per gli appuntamenti ai tuoi clienti." 
      />
      <div className="mt-8">
        <ReminderForm customers={customers} appointments={appointments} services={services} />
      </div>
    </div>
  );
}
