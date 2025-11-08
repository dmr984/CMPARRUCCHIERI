'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/page-header';
import { getAppointments, getCustomers, getServices, getStaff, saveAppointment, deleteAppointment, markReminderAsSent } from '@/lib/data';
import { AppointmentsView } from './_components/appointments-view';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Send, Bell } from 'lucide-react';
import type { Appointment, Customer, Service, Staff } from '@/lib/types';
import { AppointmentForm } from './_components/appointment-form';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase/provider';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Alert, 
  AlertDescription, 
  AlertTitle,
} from '@/components/ui/alert';
import { personalizedWhatsappReminder } from '@/ai/flows/personalized-whatsapp-reminders';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function AppointmentsPage() {
  const { db, isConfigured } = useFirebase();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | undefined>(undefined);
  const [pendingReview, setPendingReview] = useState<Appointment[]>([]);
  const { toast } = useToast();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);

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
  
  useEffect(() => {
    const now = new Date();
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);

    const appointmentsToReview = appointments.filter(app => 
        app.status === 'Programmato' &&
        app.dateTime < now &&
        app.dateTime > threeHoursAgo
    );
    setPendingReview(appointmentsToReview);
  }, [appointments]);

  const handleNewAppointment = () => {
    setEditingAppointment(undefined);
    setIsFormOpen(true);
  }

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsFormOpen(true);
  }
  
  const handleSendReminder = async (appointment: Appointment) => {
    const customer = customers.find(c => c.id === appointment.customerId);
    
    if (!customer || !db) {
        toast({ title: 'Dati mancanti', description: 'Impossibile inviare il promemoria.', variant: 'destructive'});
        return;
    }

    toast({ title: 'Generazione promemoria in corso...'});

    try {
        const result = await personalizedWhatsappReminder({
            customerName: customer.name,
            appointmentDateTime: format(appointment.dateTime, 'PPP p', { locale: it }),
            salonName: 'CMparrucchieri',
            customerPreferences: customer.preferences,
            phoneNumber: customer.phone,
        });

        const whatsappUrl = `https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(result.message)}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        
        await markReminderAsSent(db, appointment.id);

        toast({ title: 'Messaggio pronto!', description: 'Il promemoria è stato generato e aperto in WhatsApp.'});
        
        // Refetch data to show reminder sent status
        setTimeout(() => fetchData(), 1000);

    } catch (error) {
        console.error('Errore durante la generazione del promemoria:', error);
        toast({ title: 'Errore', description: 'Non è stato possibile generare il promemoria.', variant: 'destructive'});
    }
  };


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

  const triggerDeleteDialog = (appointmentId: string) => {
    setAppointmentToDelete(appointmentId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteAppointment = async () => {
    if (!db || !appointmentToDelete) return;
    await deleteAppointment(db, appointmentToDelete);
    toast({
        title: "Appuntamento Eliminato",
        description: "L'appuntamento è stato rimosso con successo.",
        variant: "destructive"
    });
    
    setTimeout(() => {
        fetchData();
        setIsFormOpen(false);
        setEditingAppointment(undefined);
        setIsDeleteDialogOpen(false);
        setAppointmentToDelete(null);
    }, 1000);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Appuntamenti" description="Gestisci il programma del tuo salone.">
        <Button onClick={handleNewAppointment} disabled={!isConfigured}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuovo Appuntamento
        </Button>
      </PageHeader>
      
      {pendingReview.length > 0 && (
          <Alert>
              <AlertTitle>Promemoria: Aggiorna Appuntamenti</AlertTitle>
              <AlertDescription>
                  <div className='space-y-2'>
                    <p>Ci sono appuntamenti conclusi di recente che potrebbero necessitare di un aggiornamento.</p>
                    {pendingReview.map(app => {
                        const customer = customers.find(c => c.id === app.customerId);
                        return (
                            <div key={app.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                                <span>{customer?.name || 'Cliente Sconosciuto'} - {app.dateTime.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit'})}</span>
                                <Button size="sm" variant="outline" onClick={() => handleEditAppointment(app)}>
                                    <Edit className="mr-2 h-4 w-4"/>
                                    Rivedi
                                </Button>
                            </div>
                        )
                    })}
                  </div>
              </AlertDescription>
          </Alert>
      )}

      <AppointmentsView
        appointments={appointments}
        customers={customers}
        services={services}
        staff={staff}
        onEditAppointment={handleEditAppointment}
        onDeleteAppointment={triggerDeleteDialog}
        onSendReminder={handleSendReminder}
      />
       {isFormOpen && (
        <AppointmentForm
            isOpen={isFormOpen}
            onClose={handleFormCancel}
            onSave={handleFormSave}
            onDelete={triggerDeleteDialog}
            appointment={editingAppointment}
            customers={customers}
            services={services}
            staff={staff}
        />
       )}
       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Sei assolutamente sicuro?</AlertDialogTitle>
                <AlertDialogDescription>
                    Questa azione non può essere annullata. Questo eliminerà definitivamente
                    l'appuntamento dai nostri server.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setAppointmentToDelete(null)}>Annulla</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAppointment}>Conferma</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
       </AlertDialog>
    </div>
  );
}
