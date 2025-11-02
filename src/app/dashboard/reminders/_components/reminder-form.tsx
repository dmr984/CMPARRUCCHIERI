'use client';
import { useState } from 'react';
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
  FormDescription,
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      appointmentId: '',
    },
  });

  const handleAppointmentChange = (appointmentId: string) => {
    const appointment = appointments.find((a) => a.id === appointmentId);
    if (appointment) {
      const customer = customers.find((c) => c.id === appointment.customerId);
      const service = services.find((s) => s.id === appointment.serviceId);
      setSelectedAppointment({
        ...appointment,
        customer,
        service,
      });
    } else {
        setSelectedAppointment(null);
    }
    setGeneratedMessage('');
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!selectedAppointment) return;

    setIsLoading(true);
    setGeneratedMessage('');

    try {
      const result = await personalizedWhatsappReminder({
        customerName: selectedAppointment.customer.name,
        appointmentDateTime: format(selectedAppointment.dateTime, 'PPP p', { locale: it }),
        serviceDetails: selectedAppointment.service.name,
        salonName: 'Salone Carmelinda',
        customerPreferences: selectedAppointment.customer.preferences,
        phoneNumber: selectedAppointment.customer.phone,
      });
      setGeneratedMessage(result.message);
    } catch (error) {
      console.error('Errore durante la generazione del promemoria:', error);
      setGeneratedMessage('Spiacenti, si è verificato un errore durante la generazione del messaggio.');
    } finally {
      setIsLoading(false);
    }
  }

  const upcomingAppointments = appointments.filter(a => new Date(a.dateTime) > new Date() && a.status === 'Programmato');

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
            <CardTitle>Genera Promemoria</CardTitle>
            <CardDescription>Seleziona un appuntamento per creare un messaggio personalizzato.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                          <SelectValue placeholder="Seleziona un appuntamento per il promemoria" />
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
              <Button type="submit" disabled={!selectedAppointment || isLoading}>
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generazione...
                    </>
                ) : (
                    <>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Genera Messaggio
                    </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card className="flex flex-col">
        <CardHeader>
            <CardTitle>Messaggio Generato</CardTitle>
            <CardDescription>Controlla il messaggio qui sotto prima di inviarlo.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-between">
          <Textarea
            readOnly
            value={generatedMessage || "Il tuo messaggio generato apparirà qui..."}
            className="flex-grow text-base"
            rows={8}
          />
          {generatedMessage && selectedAppointment && (
            <Button asChild className="mt-4 w-full" disabled={!generatedMessage}>
              <a href={`https://wa.me/${selectedAppointment.customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(generatedMessage)}`} target="_blank" rel="noopener noreferrer">
                <Send className="mr-2 h-4 w-4" />
                Invia tramite WhatsApp
              </a>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
