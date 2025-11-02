'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { getAppointments, getCustomers, getServices, getStaff } from '@/lib/data';
import { AppointmentsView } from './_components/appointments-view';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import type { Appointment, Customer, Service, Staff } from '@/lib/types';
import { AppointmentForm } from './_components/appointment-form';

// Since we are not using a real database, we'll mimic data fetching on component mount
// and then handle state updates on the client.
// In a real app, you would use server actions or API routes to mutate data
// and then re-fetch or use a state management library to update the UI.

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | undefined>(undefined);

  useState(() => {
    async function fetchData() {
      setAppointments(await getAppointments());
      setCustomers(await getCustomers());
      setServices(await getServices());
      setStaff(await getStaff());
    }
    fetchData();
  });

  const handleNewAppointment = () => {
    setEditingAppointment(undefined);
    setIsFormOpen(true);
  }

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsFormOpen(true);
  }

  const handleFormSave = (appointment: Appointment) => {
    if (editingAppointment) {
      setAppointments(appointments.map(a => a.id === appointment.id ? appointment : a));
    } else {
      setAppointments([...appointments, { ...appointment, id: (appointments.length + 1).toString() }]);
    }
    setIsFormOpen(false);
  }

  const handleFormCancel = () => {
    setIsFormOpen(false);
  }


  return (
    <div>
      <PageHeader title="Appuntamenti" description="Gestisci il programma del tuo salone.">
        <Button onClick={handleNewAppointment}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuovo Appuntamento
        </Button>
      </PageHeader>
      <AppointmentsView
        appointments={appointments}
        customers={customers}
        services={services}
        staff={staff}
        onEditAppointment={handleEditAppointment}
      />
      <AppointmentForm
        isOpen={isFormOpen}
        onClose={handleFormCancel}
        onSave={handleFormSave}
        appointment={editingAppointment}
        customers={customers}
        services={services}
        staff={staff}
      />
    </div>
  );
}
