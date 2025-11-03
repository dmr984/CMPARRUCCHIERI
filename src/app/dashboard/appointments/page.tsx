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
      setAppointments(await getAppointments(db));
      setCustomers(await getCustomers(db));
      setServices(await getServices(db));
      setStaff(await getStaff(db));
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

  const handleFormSave = async (appointmentData: Omit<Appointment, 'id' | 'dateTime'> & { id?: string, dateTime: Date }) => {
    if (!db) return;
    try {
      await saveAppointment(db, appointmentData);
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
    if (!db) return;
    try {
        await deleteAppointment(db, appointmentId);
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
