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
  
  const refetchData = async () => {
    setAppointments(await getAppointments());
  }

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
      const newId = (Math.max(0, ...appointments.map(a => parseInt(a.id, 10))) + 1).toString();
      const newAppointment = { ...appointmentData, id: newId } as Appointment;
      setAppointments([...appointments, newAppointment]);
    }
    setIsFormOpen(false);
  }

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingAppointment(undefined);
  }

  const handleDeleteAppointment = (appointmentId: string) => {
    setAppointments(appointments.filter(a => a.id !== appointmentId));
    setIsFormOpen(false);
    setEditingAppointment(undefined);
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
        onDeleteAppointment={handleDeleteAppointment}
      />
      <AppointmentForm
        isOpen={isFormOpen}
        onClose={handleFormCancel}
        onSave={handleFormSave}
        onDelete={handleDeleteAppointment}
        appointment={editingAppointment}
        customers={customers}
        services={services}
        staff={staff}
      />
    </div>
  );
}
