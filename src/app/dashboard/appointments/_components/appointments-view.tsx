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
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AppointmentsViewProps {
  appointments: Appointment[];
  customers: Customer[];
  services: Service[];
  staff: Staff[];
  onEditAppointment: (appointment: Appointment) => void;
}

export function AppointmentsView({
  appointments,
  customers,
  services,
  staff,
  onEditAppointment,
}: AppointmentsViewProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const selectedDayAppointments = date
    ? appointments.filter((app) => isSameDay(app.dateTime, date))
    : [];

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <Card className="md:col-span-1">
        <CardContent className="p-1">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="w-full"
            locale={it}
            classNames={{
                day_cell: 'h-12 w-16 text-center text-sm p-0 relative',
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
                                        <div key={index} className="h-1 w-1 rounded-full bg-primary" />
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
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>
            Appuntamenti per {date ? format(date, 'd MMMM yyyy', { locale: it }) : '...'}
          </CardTitle>
          <CardDescription>
            {selectedDayAppointments.length} appuntamento(i) programmati per questo giorno.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Servizio</TableHead>
                <TableHead>Stilista</TableHead>
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
                    const service = services.find(
                      (s) => s.id === app.serviceId
                    );
                    const stylist = staff.find((st) => st.id === app.staffId);
                    return (
                      <TableRow key={app.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage
                                src={customer?.avatarUrl}
                                alt={customer?.name}
                              />
                              <AvatarFallback>
                                {customer?.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{customer?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{service?.name}</TableCell>
                        <TableCell>{stylist?.name}</TableCell>
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
                              <DropdownMenuItem className="text-destructive">
                                Annulla
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
