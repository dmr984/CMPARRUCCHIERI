'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import type {
  Appointment,
  Customer,
  Service,
  Staff,
} from '@/lib/types';
import { format, isSameDay } from 'date-fns';
import { it } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface AppointmentsViewProps {
  appointments: Appointment[];
  customers: Customer[];
  services: Service[];
  staff: Staff[];
  onEditAppointment: (appointment: Appointment) => void;
  onDeleteAppointment: (appointmentId: string) => void;
  onSendReminder: (appointment: Appointment) => void;
}

export function AppointmentsView({
  appointments,
  customers,
  services,
  staff,
  onEditAppointment,
  onDeleteAppointment,
  onSendReminder,
}: AppointmentsViewProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const selectedDayAppointments = date
    ? appointments.filter((app) => isSameDay(app.dateTime, date))
    : [];

  const getServicesForAppointment = (serviceIds: string[]) => {
    return serviceIds
      .map(id => services.find(s => s.id === id))
      .filter((s): s is Service => !!s);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card>
          <CardContent className="p-1 flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="w-full"
              locale={it}
              classNames={{
                  day_cell: 'text-center text-sm p-0 relative',
                  day: 'h-12 w-16 p-0 font-normal',
              }}
              components={{
                  DayContent: ({ date }) => {
                      const dailyAppointments = appointments.filter((app) => isSameDay(app.dateTime, date));
                      return (
                          <>
                              <p>{date.getDate()}</p>
                              {dailyAppointments.length > 0 && (
                                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                                      {dailyAppointments.slice(0, 3).map((_, index) => (
                                          <div key={index} className="h-1.5 w-1.5 rounded-full bg-primary" />
                                      ))}
                                  </div>
                              )}
                          </>
                      )
                  }
              }}
            />
          </CardContent>
        </Card>
      </div>
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>
            Appuntamenti per {date ? format(date, 'd MMMM yyyy', { locale: it }) : '...'}
          </CardTitle>
          <CardDescription>
            {selectedDayAppointments.length} appuntamento(i) programmati per questo giorno.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden sm:table-cell">Servizio</TableHead>
                <TableHead className="hidden md:table-cell">Stilista</TableHead>
                <TableHead>Ora</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedDayAppointments.length > 0 ? (
                selectedDayAppointments
                  .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())
                  .map((app) => {
                    const customer = customers.find(
                      (c) => c.id === app.customerId
                    );
                    const appointmentServices = getServicesForAppointment(app.serviceIds);
                    const stylist = staff.find((st) => st.id === app.staffId);
                    const isUpcoming = app.dateTime > new Date() && app.status === 'Programmato';

                    return (
                      <TableRow key={app.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 hidden sm:flex">
                              <AvatarImage
                                src={customer?.avatarUrl}
                                alt={customer?.name}
                              />
                              <AvatarFallback>
                                {customer?.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex items-center gap-2">
                               {isUpcoming && (
                                <span className={cn(
                                    "h-2.5 w-2.5 rounded-full",
                                    app.reminderSent ? "bg-red-500" : "bg-green-500"
                                )} />
                               )}
                              <span className="font-medium">{customer?.name}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex flex-col gap-1">
                            {appointmentServices.map(service => (
                              <Badge key={service.id} variant="secondary" className="whitespace-nowrap">
                                {service.name}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{stylist?.name}</TableCell>
                        <TableCell>{format(app.dateTime, 'HH:mm')}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              app.status === 'Programmato'
                                ? 'default'
                                : app.status === 'Completato'
                                ? 'secondary'
                                : 'destructive'
                            }
                          >
                            {app.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => onEditAppointment(app)}>
                                Modifica/Vedi Dettagli
                              </DropdownMenuItem>
                              {isUpcoming && (
                                <DropdownMenuItem onClick={() => onSendReminder(app)} disabled={app.reminderSent} className={cn(
                                    app.reminderSent ? 'text-red-600 focus:text-red-600' : 'text-green-600 focus:text-green-600'
                                )}>
                                  <Bell className="mr-2 h-4 w-4"/>
                                  {app.reminderSent ? 'Promemoria Inviato' : 'Invia Promemoria'}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => onDeleteAppointment(app.id)}
                                className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                Elimina
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nessun appuntamento per questo giorno.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
