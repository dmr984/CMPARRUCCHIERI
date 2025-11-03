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

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | undefined>(undefined);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      setAppointments(await getAppointments());
      setCustomers(await getCustomers());
      setServices(await getServices());
      setStaff(await getStaff());
    } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({
            title: "Errore",
            description: "Impossibile caricare i dati. Assicurati che la configurazione di Firebase sia corretta.",
            variant: "destructive"
        })
    }
  }, [toast]);

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

  const handleFormSave = async (appointmentData: Omit<Appointment, 'id' | 'dateTime'> & { id?: string, dateTime: Date }) => {
    try {
      await saveAppointment(appointmentData);
      toast({
        title: "Appuntamento Salvato",
        description: "L'appuntamento è stato salvato con successo.",
      });
      fetchData(); // Refetch data to show the new/updated appointment
      setIsFormOpen(false);
      setEditingAppointment(undefined);
    } catch (error) {
      console.error("Failed to save appointment:", error);
       toast({
        title: "Errore",
        description: "Impossibile salvare l'appuntamento.",
        variant: "destructive"
      })
    }
  }

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingAppointment(undefined);
  }

  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
        await deleteAppointment(appointmentId);
        toast({
            title: "Appuntamento Eliminato",
            description: "L'appuntamento è stato eliminato.",
            variant: "destructive"
        });
        fetchData(); // Refetch
        setIsFormOpen(false);
        setEditingAppointment(undefined);
    } catch (error) {
        console.error("Failed to delete appointment:", error);
        toast({
            title: "Errore",
            description: "Impossibile eliminare l'appuntamento.",
            variant: "destructive"
        })
    }
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
