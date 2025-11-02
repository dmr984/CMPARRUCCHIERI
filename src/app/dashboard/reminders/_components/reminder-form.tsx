'use client';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Loader2, MessageCircle, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Customer, Appointment, Service } from '@/lib/types';
import { personalizedWhatsappReminder } from '@/ai/flows/personalized-whatsapp-reminders';

const formSchema = z.object({
  appointmentId: z.string().min(1, 'Seleziona un appuntamento.'),
});

interface ReminderFormProps {
  customers: Customer[];
  appointments: Appointment[];
  services: Service[];
}

export function ReminderForm({ customers, appointments, services }: ReminderFormProps) {
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [salonPhone] = useState('+39061234567'); // Static salon phone

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      appointmentId: '',
    },
  });
  
  const getServicesForAppointment = (serviceIds: string[]) => {
    return serviceIds
      .map(id => services.find(s => s.id === id))
      .filter((s): s is Service => !!s);
  };

  const generateMessage = async (appointment: any) => {
    if (!appointment) return;

    setIsLoading(true);
    setGeneratedMessage('');
    
    const appointmentServices = getServicesForAppointment(appointment.serviceIds);
    const serviceDetails = appointmentServices.map(s => s.name).join(', ');

    try {
      const result = await personalizedWhatsappReminder({
        customerName: appointment.customer.name,
        appointmentDateTime: format(appointment.dateTime, 'PPP p', { locale: it }),
        serviceDetails: serviceDetails,
        salonName: 'Salone Carmelinda',
        customerPreferences: appointment.customer.preferences,
        phoneNumber: appointment.customer.phone,
      });
      setGeneratedMessage(result.message);
    } catch (error) {
      console.error('Errore durante la generazione del promemoria:', error);
      setGeneratedMessage('Spiacenti, si è verificato un errore durante la generazione del messaggio.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppointmentChange = (appointmentId: string) => {
    const appointment = appointments.find((a) => a.id === appointmentId);
    if (appointment) {
      const customer = customers.find((c) => c.id === appointment.customerId);
      const appointmentServices = getServicesForAppointment(appointment.serviceIds);
      const fullAppointmentDetails = {
        ...appointment,
        customer,
        services: appointmentServices,
      };
      setSelectedAppointment(fullAppointmentDetails);
      generateMessage(fullAppointmentDetails);
    } else {
        setSelectedAppointment(null);
        setGeneratedMessage('');
    }
  };

  const upcomingAppointments = appointments.filter(a => new Date(a.dateTime) > new Date() && a.status === 'Programmato');

  return (
    <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
      <Card>
        <CardHeader>
            <CardTitle>Genera Promemoria</CardTitle>
            <CardDescription>Seleziona un appuntamento per creare e inviare un messaggio personalizzato.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-8">
              <FormField
                control={form.control}
                name="appointmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prossimo Appuntamento</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      handleAppointmentChange(value);
                    }} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona un appuntamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {upcomingAppointments.map((app) => {
                            const customer = customers.find(c => c.id === app.customerId);
                            return (
                                <SelectItem key={app.id} value={app.id}>
                                    {customer?.name} - {format(app.dateTime, 'd MMM, h:mm a', { locale: it })}
                                </SelectItem>
                            )
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card className="flex flex-col">
        <CardHeader>
            <CardTitle>Messaggio WhatsApp</CardTitle>
            <CardDescription>Controlla il messaggio generato e invialo al tuo telefono per inoltrarlo.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-between">
            {isLoading ? (
                 <div className="flex-grow flex items-center justify-center">
                    <div className='flex flex-col items-center gap-2'>
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className='text-muted-foreground'>Generazione del messaggio...</p>
                    </div>
                </div>
            ) : (
                <Textarea
                    readOnly
                    value={generatedMessage || "Seleziona un appuntamento per generare un messaggio."}
                    className="flex-grow text-base"
                    rows={8}
                />
            )}
         
          {generatedMessage && !isLoading && selectedAppointment && (
            <Button asChild className="mt-4 w-full" disabled={!generatedMessage}>
              <a href={`https://wa.me/${salonPhone.replace(/\D/g, '')}?text=${encodeURIComponent(generatedMessage)}`} target="_blank" rel="noopener noreferrer">
                <Send className="mr-2 h-4 w-4" />
                Invia a te stesso tramite WhatsApp
              </a>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
