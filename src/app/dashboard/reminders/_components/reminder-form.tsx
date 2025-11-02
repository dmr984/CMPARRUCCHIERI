'use client';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
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
  appointmentId: z.string().min(1, 'Please select an appointment.'),
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
        appointmentDateTime: format(selectedAppointment.dateTime, 'PPP p'),
        serviceDetails: selectedAppointment.service.name,
        salonName: 'Carmelinda Salon',
        customerPreferences: selectedAppointment.customer.preferences,
        phoneNumber: selectedAppointment.customer.phone,
      });
      setGeneratedMessage(result.message);
    } catch (error) {
      console.error('Error generating reminder:', error);
      setGeneratedMessage('Sorry, there was an error generating the message.');
    } finally {
      setIsLoading(false);
    }
  }

  const upcomingAppointments = appointments.filter(a => new Date(a.dateTime) > new Date() && a.status === 'Scheduled');

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
            <CardTitle>Generate Reminder</CardTitle>
            <CardDescription>Select an appointment to create a personalized message.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="appointmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upcoming Appointment</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      handleAppointmentChange(value);
                    }} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an appointment to remind" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {upcomingAppointments.map((app) => {
                            const customer = customers.find(c => c.id === app.customerId);
                            return (
                                <SelectItem key={app.id} value={app.id}>
                                    {customer?.name} - {format(app.dateTime, 'MMM d, h:mm a')}
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
                        Generating...
                    </>
                ) : (
                    <>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Generate Message
                    </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card className="flex flex-col">
        <CardHeader>
            <CardTitle>Generated Message</CardTitle>
            <CardDescription>Review the message below before sending.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-between">
          <Textarea
            readOnly
            value={generatedMessage || "Your generated message will appear here..."}
            className="flex-grow text-base"
            rows={8}
          />
          {generatedMessage && selectedAppointment && (
            <Button asChild className="mt-4 w-full" disabled={!generatedMessage}>
              <a href={`https://wa.me/${selectedAppointment.customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(generatedMessage)}`} target="_blank" rel="noopener noreferrer">
                <Send className="mr-2 h-4 w-4" />
                Send via WhatsApp
              </a>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
