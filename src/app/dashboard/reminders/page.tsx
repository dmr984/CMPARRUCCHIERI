'use client';
import { getCustomers, getAppointments, getServices, getWhatsAppSettings, getSalonProfile, defaultWhatsAppSettings } from '@/lib/data';
import { ReminderForm } from './_components/reminder-form';
import { PageHeader } from '@/components/page-header';
import { useState, useEffect, useCallback } from 'react';
import type { Customer, Appointment, Service, WhatsAppSettings, SalonProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase/provider';

export default function RemindersPage() {
  const { db, isConfigured } = useFirebase();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [whatsappSettings, setWhatsappSettings] = useState<WhatsAppSettings>(defaultWhatsAppSettings);
  const [salonProfile, setSalonProfile] = useState<SalonProfile | null>(null);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    if (!isConfigured || !db) return;
    try {
        const [customersData, appointmentsData, servicesData, waSettings, profile] = await Promise.all([
          getCustomers(db),
          getAppointments(db),
          getServices(db),
          getWhatsAppSettings(db),
          getSalonProfile(db)
        ]);
        setCustomers(customersData);
        setAppointments(appointmentsData);
        setServices(servicesData);
        if (waSettings) setWhatsappSettings(waSettings);
        if (profile) setSalonProfile(profile);
    } catch(error) {
        console.error("Failed to fetch reminders data:", error);
        toast({
            title: "Errore",
            description: "Impossibile caricare i dati per i promemoria. Assicurati che la configurazione di Firebase sia corretta.",
            variant: "destructive"
        })
    }
  }, [toast, db, isConfigured]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Promemoria WhatsApp" 
        description="Gestisci e invia promemoria automatici e personalizzati per gli appuntamenti ai tuoi clienti." 
      />
      <div>
        <ReminderForm 
          customers={customers} 
          appointments={appointments} 
          services={services} 
          whatsappSettings={whatsappSettings}
          salonProfile={salonProfile}
          onRefresh={fetchData}
        />
      </div>
    </div>
  );
}
