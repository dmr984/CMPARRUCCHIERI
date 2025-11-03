'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/page-header';
import { getAppointments, getCustomers, getServices, getStaff, saveAppointment, deleteAppointment } from '@/lib/data';
import { AppointmentsView } from './_components/appointments-view';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import type { Appointment, Customer, Service, Staff } from '@/lib/types';
import { AppointmentForm } from './_components/appointment-form';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase/provider';

export default function AppointmentsPage() {
  const { db, isConfigured } = useFirebase();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | undefined>(undefined);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    if (!isConfigured || !db) return;
    try {
      const [appointments, customers, services, staff] = await Promise.all([
        getAppointments(db),
        getCustomers(db),
        getServices(db),
        getStaff(db)
      ]);
      setAppointments(appointments);
      setCustomers(customers);
      setServices(services);
      setStaff(staff);
    } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({
            title: "Errore",
            description: "Impossibile caricare i dati. Assicurati che la configurazione di Firebase sia corretta.",
            variant: "destructive"
        })
    }
  }, [toast, db, isConfigured]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleNewAppointment = () => {
    setEditingAppointment(undefined);
    setIsFormOpen(true);
  }

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsFormOpen(true);
  }

  const handleFormSave = (appointmentData: Omit<Appointment, 'id' | 'dateTime'> & { id?: string, dateTime: Date }) => {
    if (!db) return;
    saveAppointment(db, appointmentData);
    toast({
      title: "Salvataggio in corso...",
      description: "L'appuntamento è in fase di salvataggio.",
    });
    // Optimistic update can be implemented here if desired
    // For now, just refetch
    setTimeout(() => fetchData(), 1000); // Give firestore some time to update
    setIsFormOpen(false);
    setEditingAppointment(undefined);
  }

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingAppointment(undefined);
  }

  const handleDeleteAppointment = (appointmentId: string) => {
    if (!db) return;
    deleteAppointment(db, appointmentId);
    toast({
        title: "Appuntamento Eliminato",
        description: "L'appuntamento è stato eliminato.",
        variant: "destructive"
    });
    // Optimistic update or refetch
    setTimeout(() => fetchData(), 1000);
    setIsFormOpen(false);
    setEditingAppointment(undefined);
  }

  return (
    <div>
      <PageHeader title="Appuntamenti" description="Gestisci il programma del tuo salone.">
        <Button onClick={handleNewAppointment} disabled={!isConfigured}>
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
       {isFormOpen && (
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
       )}
    </div>
  );
}
