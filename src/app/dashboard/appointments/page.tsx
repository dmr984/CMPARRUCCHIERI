'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { getAppointments, getCustomers, getServices, getStaff } from '@/lib/data';
import { AppointmentsView } from './_components/appointments-view';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import type { Appointment, Customer, Service, Staff } from '@/lib/types';
import { AppointmentForm } from './_components/appointment-form';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | undefined>(undefined);

  useEffect(() => {
    async function fetchData() {
      setAppointments(await getAppointments());
      setCustomers(await getCustomers());
      setServices(await getServices());
      setStaff(await getStaff());
    }
    fetchData();
  }, []);

  const handleNewAppointment = () => {
    setEditingAppointment(undefined);
    setIsFormOpen(true);
  }

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsFormOpen(true);
  }

  const handleFormSave = (appointmentData: Omit<Appointment, 'id'> & { id?: string }) => {
    if (appointmentData.id) {
      setAppointments(appointments.map(a => a.id === appointmentData.id ? { ...a, ...appointmentData } as Appointment : a));
    } else {
       const newId = (Math.max(0, ...appointments.map(a => parseInt(a.id))) + 1).toString();
      setAppointments([...appointments, { ...appointmentData, id: newId } as Appointment]);
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

    