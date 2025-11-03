'use client';
import { getCustomers, getAppointments, getServices } from '@/lib/data';
import { ReminderForm } from './_components/reminder-form';
import { PageHeader } from '@/components/page-header';
import { useState, useEffect, useCallback } from 'react';
import type { Customer, Appointment, Service } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function RemindersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
        setCustomers(await getCustomers());
        setAppointments(await getAppointments());
        setServices(await getServices());
    } catch(error) {
        console.error("Failed to fetch reminders data:", error);
        toast({
            title: "Errore",
            description: "Impossibile caricare i dati per i promemoria. Assicurati che la configurazione di Firebase sia corretta.",
            variant: "destructive"
        })
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
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
