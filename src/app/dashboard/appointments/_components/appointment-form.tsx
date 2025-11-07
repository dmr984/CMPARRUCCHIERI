'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { CalendarIcon, Loader2, Check, ChevronsUpDown } from 'lucide-react';

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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import type { Appointment, Customer, Service, Staff, AppointmentStatus } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  customerId: z.string().min(1, 'È richiesto un cliente.'),
  serviceIds: z.array(z.string()).min(1, 'È richiesto almeno un servizio.'),
  staffId: z.string().min(1, 'È richiesto uno stilista.'),
  date: z.date({ required_error: 'È richiesta una data.' }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato ora non valido (HH:MM).'),
  status: z.enum(['Programmato', 'Completato', 'Annullato']),
  notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof formSchema>;

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: Omit<Appointment, 'id'> & { id?: string }) => void;
  onDelete: (appointmentId: string) => void;
  appointment?: Appointment;
  customers: Customer[];
  services: Service[];
  staff: Staff[];
}

export function AppointmentForm({
  isOpen,
  onClose,
  onSave,
  onDelete,
  appointment,
  customers,
  services,
  staff,
}: AppointmentFormProps) {
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: '',
      serviceIds: [],
      staffId: '',
      time: '',
      status: 'Programmato',
      notes: '',
    },
  });
  
  const [openCustomerCombobox, setOpenCustomerCombobox] = useState(false);
  const [openServicesCombobox, setOpenServicesCombobox] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const initialValues = appointment
        ? {
            customerId: appointment.customerId,
            serviceIds: appointment.serviceIds,
            staffId: appointment.staffId,
            date: appointment.dateTime,
            time: format(appointment.dateTime, 'HH:mm'),
            status: appointment.status,
            notes: appointment.notes || '',
          }
        : {
            customerId: '',
            serviceIds: [],
            staffId: '',
            date: new Date(),
            time: '',
            status: 'Programmato' as AppointmentStatus,
            notes: '',
          };
      form.reset(initialValues);
    }
  }, [isOpen, appointment, form]);

  const onSubmit = (data: AppointmentFormValues) => {
    const [hours, minutes] = data.time.split(':').map(Number);
    const dateTime = new Date(data.date);
    dateTime.setHours(hours, minutes);

    onSave({
      id: appointment?.id,
      customerId: data.customerId,
      serviceIds: data.serviceIds,
      staffId: data.staffId,
      dateTime,
      status: data.status,
      notes: data.notes,
    });
  };

  const handleDelete = () => {
    if (appointment) {
        onDelete(appointment.id);
    }
  };

  const { isSubmitting } = form.formState;
  const title = appointment ? 'Modifica Appuntamento' : 'Nuovo Appuntamento';
  const description = appointment
    ? 'Modifica i dettagli qui sotto.'
    : 'Compila i dettagli per creare un nuovo appuntamento.';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md md:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Cliente</FormLabel>
                         <Popover open={openCustomerCombobox} onOpenChange={setOpenCustomerCombobox}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? customers.find(
                                      (customer) => customer.id === field.value
                                    )?.name
                                  : "Seleziona un cliente"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                              <CommandInput placeholder="Cerca cliente..." />
                              <CommandList>
                                <CommandEmpty>Nessun cliente trovato.</CommandEmpty>
                                <CommandGroup>
                                  {customers.map((customer) => (
                                    <CommandItem
                                      value={customer.name}
                                      key={customer.id}
                                      onSelect={() => {
                                        form.setValue("customerId", customer.id)
                                        setOpenCustomerCombobox(false)
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          customer.id === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {customer.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="serviceIds"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Servizi</FormLabel>
                        <Popover open={openServicesCombobox} onOpenChange={setOpenServicesCombobox}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  'w-full justify-between',
                                  !field.value?.length && 'text-muted-foreground'
                                )}
                              >
                                <div className="flex gap-1 flex-wrap">
                                  {field.value?.length > 0 ? (
                                    services
                                      .filter((s) => field.value.includes(s.id))
                                      .map((s) => <Badge variant="secondary" key={s.id}>{s.name}</Badge>)
                                  ) : (
                                    <span>Seleziona servizi</span>
                                  )}
                                </div>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                              <CommandInput placeholder="Cerca servizio..." />
                              <CommandList>
                                <CommandEmpty>Nessun servizio trovato.</CommandEmpty>
                                <CommandGroup>
                                  {services.map((service) => (
                                    <CommandItem
                                      value={service.name}
                                      key={service.id}
                                      onSelect={() => {
                                        const currentServiceIds = field.value || [];
                                        const isSelected = currentServiceIds.includes(service.id);
                                        const newServiceIds = isSelected
                                          ? currentServiceIds.filter((id) => id !== service.id)
                                          : [...currentServiceIds, service.id];
                                        field.onChange(newServiceIds);
                                        setOpenServicesCombobox(true); // Keep the popover open
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          'mr-2 h-4 w-4',
                                          field.value?.includes(service.id) ? 'opacity-100' : 'opacity-0'
                                        )}
                                      />
                                      {service.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="staffId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stilista</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona uno stilista" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {staff.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stato</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona stato" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(['Programmato', 'Completato', 'Annullato'] as AppointmentStatus[]).map(status => (
                                <SelectItem key={status} value={status}>
                                    {status}
                                </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP', { locale: it })
                                ) : (
                                  <span>Scegli una data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date('1900-01-01')}
                              initialFocus
                              locale={it}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ora (HH:MM)</FormLabel>
                        <FormControl>
                          <Input placeholder="Es: 14:30" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Note Aggiuntive</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Note sull'appuntamento o preferenze del cliente..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

            <DialogFooter className="justify-between pt-4">
                <div>
                {appointment && (
                    <Button type="button" variant="destructive" onClick={handleDelete}>
                        Annulla Appuntamento
                    </Button>
                )}
                </div>
                <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                    Chiudi
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salva Appuntamento
                </Button>
                </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
