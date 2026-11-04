'use client';
import { useState, useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format, isToday, isTomorrow, isSameDay, addDays, startOfDay } from 'date-fns';
import { it } from 'date-fns/locale';
import {
  Loader2,
  MessageCircle,
  Send,
  Sparkles,
  FileText,
  CheckCircle2,
  Clock,
  Settings,
  RefreshCw,
  Calendar,
  Users,
  ChevronRight,
  ArrowRight,
  SkipForward,
  RotateCcw,
} from 'lucide-react';
import Link from 'next/link';

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
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Customer, Appointment, Service, WhatsAppSettings, SalonProfile } from '@/lib/types';
import { personalizedWhatsappReminder } from '@/ai/flows/personalized-whatsapp-reminders';
import { useFirebase } from '@/firebase/provider';
import { markAppointmentReminderSent, setAppointmentReminderStatus } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  appointmentId: z.string().min(1, 'Seleziona un appuntamento.'),
});

interface ReminderFormProps {
  customers: Customer[];
  appointments: Appointment[];
  services: Service[];
  whatsappSettings: WhatsAppSettings;
  salonProfile: SalonProfile | null;
  onRefresh?: () => void;
}

type DateFilterType = 'tomorrow' | 'today' | 'custom' | 'all';

export function ReminderForm({
  customers,
  appointments,
  services,
  whatsappSettings,
  salonProfile,
  onRefresh,
}: ReminderFormProps) {
  const { db } = useFirebase();
  const { toast } = useToast();

  const [message, setMessage] = useState('');
  const [selectedAppointmentDetails, setSelectedAppointmentDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messageMode, setMessageMode] = useState<'standard' | 'ai'>('standard');
  const [availableAppointments, setAvailableAppointments] = useState<Appointment[]>([]);

  // Filtro data per lista e invio multiplo
  const [dateFilter, setDateFilter] = useState<DateFilterType>('tomorrow');
  const [customDate, setCustomDate] = useState<string>(
    format(addDays(new Date(), 1), 'yyyy-MM-dd')
  );

  // Stato per la Coda di Invio Multiplo Guidato
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [queueList, setQueueList] = useState<any[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [queueCurrentMessage, setQueueCurrentMessage] = useState('');
  const [queueCompleted, setQueueCompleted] = useState(false);

  useEffect(() => {
    // Ordina tutti gli appuntamenti futuri o programmati per data crescente
    const upcoming = appointments
      .filter((a) => a.status === 'Programmato')
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
    setAvailableAppointments(upcoming);
  }, [appointments]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      appointmentId: '',
    },
  });

  const getServicesForAppointment = (serviceIds: string[]) => {
    return serviceIds
      .map((id) => services.find((s) => s.id === id))
      .filter((s): s is Service => !!s);
  };

  const buildStandardMessage = (appointmentDetails: any) => {
    const template =
      whatsappSettings?.template ||
      'Ciao {nome}! Ti ricordiamo il tuo appuntamento da {salone} previsto per {data} alle ore {ora} ({servizi}). Per disdette o modifiche avvisaci con anticipo. A presto!';

    const customerName = appointmentDetails.customer?.name || 'Gentile Cliente';
    const salonName = salonProfile?.name || 'Salone Carmelinda';
    const dateStr = format(new Date(appointmentDetails.dateTime), 'EEEE d MMMM', { locale: it });
    const timeStr = format(new Date(appointmentDetails.dateTime), 'HH:mm', { locale: it });
    const servicesStr =
      appointmentDetails.services?.map((s: Service) => s.name).join(', ') || 'trattamento';

    return template
      .replace(/{nome}/g, customerName)
      .replace(/{salone}/g, salonName)
      .replace(/{data}/g, dateStr)
      .replace(/{ora}/g, timeStr)
      .replace(/{servizi}/g, servicesStr);
  };

  const generateAIMessage = async (appointmentDetails: any) => {
    if (!appointmentDetails) return;
    setIsLoading(true);
    try {
      const result = await personalizedWhatsappReminder({
        customerName: appointmentDetails.customer?.name || 'Cliente',
        appointmentDateTime: format(new Date(appointmentDetails.dateTime), 'PPP p', { locale: it }),
        salonName: salonProfile?.name || 'CMparrucchieri',
        customerPreferences: appointmentDetails.customer?.preferences,
        phoneNumber: appointmentDetails.customer?.phone || '',
      });
      setMessage(result.message);
    } catch (error) {
      console.error('Errore durante la generazione del promemoria AI:', error);
      toast({
        title: 'Generazione AI non riuscita',
        description: 'Utilizzo del modello standard dalle impostazioni.',
        variant: 'destructive',
      });
      setMessage(buildStandardMessage(appointmentDetails));
    } finally {
      setIsLoading(false);
    }
  };

  const selectAppointment = (appointmentId: string, preferredMode?: 'standard' | 'ai') => {
    form.setValue('appointmentId', appointmentId);
    const appointment = availableAppointments.find((a) => a.id === appointmentId);
    if (!appointment) {
      setSelectedAppointmentDetails(null);
      setMessage('');
      return;
    }

    const customer = customers.find((c) => c.id === appointment.customerId);
    const appointmentServices = getServicesForAppointment(appointment.serviceIds);
    const fullDetails = {
      ...appointment,
      customer,
      services: appointmentServices,
    };
    setSelectedAppointmentDetails(fullDetails);

    const mode = preferredMode || messageMode;
    if (mode === 'ai') {
      generateAIMessage(fullDetails);
    } else {
      setMessage(buildStandardMessage(fullDetails));
    }
  };

  const handleModeSwitch = (mode: 'standard' | 'ai') => {
    setMessageMode(mode);
    if (selectedAppointmentDetails) {
      if (mode === 'ai') {
        generateAIMessage(selectedAppointmentDetails);
      } else {
        setMessage(buildStandardMessage(selectedAppointmentDetails));
      }
    }
  };

  const executeSendWhatsapp = async (details: any, text: string) => {
    if (!details || !text) return false;

    const rawPhone = details.customer?.phone || '';
    const cleanPhone = rawPhone.replace(/\D/g, '');

    if (!cleanPhone) {
      toast({
        title: 'Numero di telefono mancante',
        description: `Il cliente ${details.customer?.name} non ha un numero di telefono valido.`,
        variant: 'destructive',
      });
      return false;
    }

    const internationalPhone =
      cleanPhone.startsWith('39') && cleanPhone.length > 10
        ? cleanPhone
        : cleanPhone.length === 10
        ? `39${cleanPhone}`
        : cleanPhone;

    const whatsappUrl = `https://wa.me/${internationalPhone}?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    if (db && details.id) {
      await markAppointmentReminderSent(db, details.id);
    }

    return true;
  };

  const handleSend = async (detailsToSend?: any, textToSend?: string) => {
    const details = detailsToSend || selectedAppointmentDetails;
    const text = textToSend || message;

    if (!details || !text) {
      toast({
        title: 'Attenzione',
        description: 'Nessun appuntamento o messaggio selezionato.',
        variant: 'destructive',
      });
      return;
    }

    const success = await executeSendWhatsapp(details, text);
    if (success) {
      toast({
        title: 'WhatsApp aperto con successo!',
        description: `Messaggio preparato per ${details.customer?.name}. Premi "Invio" nella chat per confermare.`,
      });
      onRefresh?.();
    }
  };

  const handleQuickSend = (appointment: Appointment) => {
    const customer = customers.find((c) => c.id === appointment.customerId);
    const appointmentServices = getServicesForAppointment(appointment.serviceIds);
    const fullDetails = {
      ...appointment,
      customer,
      services: appointmentServices,
    };
    setSelectedAppointmentDetails(fullDetails);
    form.setValue('appointmentId', appointment.id);
    const text = buildStandardMessage(fullDetails);
    setMessage(text);
    handleSend(fullDetails, text);
  };

  const handleToggleReminderStatus = async (appointment: Appointment) => {
    if (!db) return;
    const newStatus = !appointment.reminderSent;
    const customer = customers.find((c) => c.id === appointment.customerId);
    await setAppointmentReminderStatus(db, appointment.id, newStatus);
    toast({
      title: newStatus ? 'Stato: Inviato' : 'Stato reimpostato: Da inviare',
      description: `Il promemoria per ${customer?.name || 'il cliente'} è ora segnato come "${newStatus ? 'Inviato' : 'Da inviare'}".`,
    });
    onRefresh?.();
  };

  // Filtro della lista per data
  const filteredAppointments = useMemo(() => {
    return availableAppointments.filter((app) => {
      const appDate = new Date(app.dateTime);
      if (dateFilter === 'today') return isToday(appDate);
      if (dateFilter === 'tomorrow') return isTomorrow(appDate);
      if (dateFilter === 'custom') {
        const target = new Date(customDate + 'T00:00:00');
        return isSameDay(appDate, target);
      }
      return true; // 'all'
    });
  }, [availableAppointments, dateFilter, customDate]);

  // Appuntamenti ancora da inviare nella data selezionata
  const pendingFilteredAppointments = useMemo(() => {
    return filteredAppointments.filter((app) => !app.reminderSent);
  }, [filteredAppointments]);

  // Etichetta leggibile della data selezionata
  const selectedDateLabel = useMemo(() => {
    if (dateFilter === 'tomorrow') return 'Domani';
    if (dateFilter === 'today') return 'Oggi';
    if (dateFilter === 'custom') {
      try {
        return format(new Date(customDate + 'T00:00:00'), 'd MMMM yyyy', { locale: it });
      } catch {
        return customDate;
      }
    }
    return 'Tutti i prossimi appuntamenti';
  }, [dateFilter, customDate]);

  // Avvio Invio Multiplo Guidato
  const startQueue = (onlyPending = true) => {
    const itemsToProcess = onlyPending
      ? pendingFilteredAppointments
      : filteredAppointments;

    if (itemsToProcess.length === 0) {
      toast({
        title: 'Nessun promemoria da inviare',
        description: `Tutti i clienti per ${selectedDateLabel} hanno già ricevuto il promemoria!`,
      });
      return;
    }

    const preparedQueue = itemsToProcess.map((app) => {
      const customer = customers.find((c) => c.id === app.customerId);
      const appServices = getServicesForAppointment(app.serviceIds);
      return {
        ...app,
        customer,
        services: appServices,
      };
    });

    setQueueList(preparedQueue);
    setQueueIndex(0);
    setQueueCompleted(false);
    setQueueCurrentMessage(buildStandardMessage(preparedQueue[0]));
    setIsQueueOpen(true);
  };

  // Avanzamento nella Coda
  const handleQueueSendCurrent = async () => {
    const currentItem = queueList[queueIndex];
    if (!currentItem) return;

    await executeSendWhatsapp(currentItem, queueCurrentMessage);

    const nextIndex = queueIndex + 1;
    if (nextIndex < queueList.length) {
      setQueueIndex(nextIndex);
      setQueueCurrentMessage(buildStandardMessage(queueList[nextIndex]));
    } else {
      setQueueCompleted(true);
      onRefresh?.();
    }
  };

  const handleQueueSkipCurrent = () => {
    const nextIndex = queueIndex + 1;
    if (nextIndex < queueList.length) {
      setQueueIndex(nextIndex);
      setQueueCurrentMessage(buildStandardMessage(queueList[nextIndex]));
    } else {
      setQueueCompleted(true);
      onRefresh?.();
    }
  };

  const getTimingDescription = () => {
    if (!whatsappSettings?.enabled) return 'Promemoria disattivati (puoi attivarli nelle impostazioni)';
    if (whatsappSettings.timingType === '1_hour') return "Regola attiva: Invio 1 ora prima dell'appuntamento";
    if (whatsappSettings.timingType === '2_hours') return "Regola attiva: Invio 2 ore prima dell'appuntamento";
    if (whatsappSettings.timingType === '3_hours') return "Regola attiva: Invio 3 ore prima dell'appuntamento";
    if (whatsappSettings.timingType === 'custom_hours')
      return `Regola attiva: Invio ${whatsappSettings.customHours || 4} ore prima dell'appuntamento`;
    if (whatsappSettings.timingType === '1_day' || whatsappSettings.timingType === 'day_before')
      return `Regola attiva: Invio 1 giorno prima alle ore ${whatsappSettings.sendTime || '09:00'}`;
    if (whatsappSettings.timingType === '2_days')
      return `Regola attiva: Invio 2 giorni prima alle ore ${whatsappSettings.sendTime || '09:00'}`;
    if (whatsappSettings.timingType === 'custom_days')
      return `Regola attiva: Invio ${whatsappSettings.customDays || 3} giorni prima alle ore ${whatsappSettings.sendTime || '09:00'}`;
    return 'Regola attiva: Promemoria configurati';
  };

  return (
    <div className="space-y-6">
      {/* Barra Stato Regola Attiva */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3.5 rounded-lg border bg-card text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
            <Clock className="h-3.5 w-3.5" />
          </div>
          <span className="font-medium text-foreground">{getTimingDescription()}</span>
        </div>
        <Link
          href="/dashboard/settings"
          className="text-primary hover:underline flex items-center gap-1 font-medium ml-7 sm:ml-0"
        >
          <Settings className="h-3.5 w-3.5" />
          Modifica orario e testo standard nelle Impostazioni
        </Link>
      </div>

      {/* SEZIONE SPECIALE: INVIO MULTIPLO PER DATA (DOMANI / DATA SPECIFICA) */}
      <Card className="border-emerald-200 dark:border-emerald-800/50 bg-gradient-to-r from-emerald-50/40 via-card to-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600" />
                <CardTitle className="text-lg">Invio Multiplo ai Clienti</CardTitle>
                <Badge variant="outline" className="text-emerald-700 bg-emerald-100/60 dark:bg-emerald-950/60 text-xs">
                  {pendingFilteredAppointments.length} da inviare
                </Badge>
              </div>
              <CardDescription>
                Invia tutti i promemoria per una data specifica in sequenza con 1 click per ciascuno.
              </CardDescription>
            </div>

            {/* Bottone Principale Invia a Tutti */}
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm gap-2"
              onClick={() => startQueue(pendingFilteredAppointments.length > 0)}
              disabled={filteredAppointments.length === 0}
            >
              <Send className="h-4 w-4" />
              <span>
                {pendingFilteredAppointments.length > 0
                  ? `Invia a tutti i clienti di ${selectedDateLabel}`
                  : `Reinvia a tutti i clienti di ${selectedDateLabel}`}
              </span>
              {pendingFilteredAppointments.length > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-800 text-xs text-white">
                  {pendingFilteredAppointments.length}
                </span>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          {/* Selettore Data */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t text-sm">
            <span className="text-xs text-muted-foreground font-medium uppercase mr-1">Seleziona Data:</span>

            <Button
              type="button"
              size="sm"
              variant={dateFilter === 'tomorrow' ? 'default' : 'outline'}
              className="h-8 text-xs font-medium gap-1.5"
              onClick={() => setDateFilter('tomorrow')}
            >
              <Calendar className="h-3.5 w-3.5" />
              Domani
            </Button>

            <Button
              type="button"
              size="sm"
              variant={dateFilter === 'today' ? 'default' : 'outline'}
              className="h-8 text-xs font-medium gap-1.5"
              onClick={() => setDateFilter('today')}
            >
              <Calendar className="h-3.5 w-3.5" />
              Oggi
            </Button>

            <Button
              type="button"
              size="sm"
              variant={dateFilter === 'custom' ? 'default' : 'outline'}
              className="h-8 text-xs font-medium gap-1.5"
              onClick={() => setDateFilter('custom')}
            >
              <Calendar className="h-3.5 w-3.5" />
              Data Specifica
            </Button>

            {dateFilter === 'custom' && (
              <Input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="h-8 w-auto text-xs px-2.5"
              />
            )}

            <Button
              type="button"
              size="sm"
              variant={dateFilter === 'all' ? 'default' : 'ghost'}
              className="h-8 text-xs font-medium text-muted-foreground ml-auto"
              onClick={() => setDateFilter('all')}
            >
              Tutti ({availableAppointments.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Box Generazione e Invio Singolo */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Singolo Promemoria</CardTitle>
              <Link
                href="/dashboard/settings"
                className="text-xs text-primary flex items-center gap-1 hover:underline"
              >
                <Settings className="h-3.5 w-3.5" />
                Modifica Testo Standard
              </Link>
            </div>
            <CardDescription>
              Seleziona un singolo appuntamento per vedere o personalizzare il messaggio.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...form}>
              <form className="space-y-4">
                <FormField
                  control={form.control}
                  name="appointmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Appuntamento in programma</FormLabel>
                      <Select onValueChange={(val) => selectAppointment(val)} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona un appuntamento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableAppointments.length > 0 ? (
                            availableAppointments.map((app) => {
                              const customer = customers.find((c) => c.id === app.customerId);
                              const isSent = app.reminderSent;
                              return (
                                <SelectItem key={app.id} value={app.id}>
                                  <div className="flex items-center gap-2">
                                    <span>{customer?.name || 'Cliente'}</span>
                                    <span className="text-muted-foreground text-xs">
                                      - {format(new Date(app.dateTime), 'd MMM, HH:mm', { locale: it })}
                                    </span>
                                    {isSent && (
                                      <span className="text-[10px] text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 rounded font-medium">
                                        Già Inviato
                                      </span>
                                    )}
                                  </div>
                                </SelectItem>
                              );
                            })
                          ) : (
                            <SelectItem value="none" disabled>
                              Nessun appuntamento in programma
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>

            {/* Scelta Modalità Messaggio */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase font-semibold">Tipo di Messaggio</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={messageMode === 'standard' ? 'default' : 'outline'}
                  size="sm"
                  className="flex items-center justify-center gap-1.5"
                  onClick={() => handleModeSwitch('standard')}
                >
                  <FileText className="h-4 w-4" />
                  <span>Testo Standard</span>
                </Button>
                <Button
                  type="button"
                  variant={messageMode === 'ai' ? 'default' : 'outline'}
                  size="sm"
                  className="flex items-center justify-center gap-1.5"
                  onClick={() => handleModeSwitch('ai')}
                >
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>Personalizza con AI</span>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {messageMode === 'standard'
                  ? 'Usa il modello predefinito configurato nelle Impostazioni con i dati compilati automaticamente.'
                  : "Usa l'intelligenza artificiale per creare un testo cordiale e personalizzato sulle preferenze del cliente."}
              </p>
            </div>

            {selectedAppointmentDetails && (
              <div className="p-3 border rounded-lg bg-muted/30 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cliente:</span>
                  <span className="font-medium">{selectedAppointmentDetails.customer?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Telefono:</span>
                  <span className="font-mono">{selectedAppointmentDetails.customer?.phone || 'Non presente'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data & Ora:</span>
                  <span className="font-medium">
                    {format(new Date(selectedAppointmentDetails.dateTime), 'EEEE d MMMM, HH:mm', { locale: it })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trattamenti:</span>
                  <span className="font-medium">
                    {selectedAppointmentDetails.services?.map((s: Service) => s.name).join(', ') || 'Nessuno'}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card Messaggio e Invio */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-emerald-500" />
                Messaggio WhatsApp
              </CardTitle>
              {selectedAppointmentDetails && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground"
                  onClick={() => setMessage(buildStandardMessage(selectedAppointmentDetails))}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Ripristina Standard
                </Button>
              )}
            </div>
            <CardDescription>
              Puoi modificare liberamente il testo qui sotto prima di aprire WhatsApp.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-between space-y-4">
            {isLoading ? (
              <div className="flex-grow flex items-center justify-center p-8">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Generazione del messaggio in corso...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2 flex-grow flex flex-col">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Seleziona un appuntamento a sinistra per preparare il messaggio..."
                  className="flex-grow min-h-[160px] text-sm leading-relaxed"
                />
                <p className="text-[11px] text-muted-foreground">
                  Puoi scrivere o correggere qualsiasi parola direttamente nel riquadro sopra.
                </p>
              </div>
            )}

            <Button
              onClick={() => handleSend()}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
              disabled={!message || isLoading || !selectedAppointmentDetails}
            >
              <Send className="mr-2 h-4 w-4" />
              Invia al Cliente tramite WhatsApp
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tabella Appuntamenti per la Data Selezionata */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Appuntamenti di {selectedDateLabel}
            </CardTitle>
            <CardDescription>
              Lista degli appuntamenti programmati. Clicca sul pulsante verde per inviare il promemoria singolo.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {filteredAppointments.length} Appuntamenti trovati
            </Badge>
            {pendingFilteredAppointments.length > 0 && (
              <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-xs">
                {pendingFilteredAppointments.length} da notificare
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data & Ora</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Telefono</TableHead>
                  <TableHead>Servizi</TableHead>
                  <TableHead>Stato Promemoria</TableHead>
                  <TableHead className="text-right">Azione Rapida</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((app) => {
                    const customer = customers.find((c) => c.id === app.customerId);
                    const appServices = getServicesForAppointment(app.serviceIds);
                    const isSent = app.reminderSent;

                    return (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium whitespace-nowrap">
                          {format(new Date(app.dateTime), 'EEE d MMM, HH:mm', { locale: it })}
                        </TableCell>
                        <TableCell className="font-medium">{customer?.name || 'Cliente sconosciuto'}</TableCell>
                        <TableCell className="font-mono text-xs">{customer?.phone || '-'}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground text-xs">
                          {appServices.map((s) => s.name).join(', ') || '-'}
                        </TableCell>
                        <TableCell>
                          <button
                            type="button"
                            onClick={() => handleToggleReminderStatus(app)}
                            title="Clicca per cambiare lo stato tra Inviato e Da inviare"
                            className="group transition-transform active:scale-95"
                          >
                            {isSent ? (
                              <Badge
                                variant="secondary"
                                className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 gap-1 font-normal text-xs cursor-pointer group-hover:ring-2 group-hover:ring-emerald-400"
                              >
                                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                Inviato
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="border-amber-400 text-amber-700 dark:text-amber-400 font-normal text-xs cursor-pointer group-hover:ring-2 group-hover:ring-amber-400"
                              >
                                Da inviare
                              </Badge>
                            )}
                          </button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isSent && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-xs text-muted-foreground hover:text-amber-600"
                                title="Se non hai inviato il messaggio, reimposta lo stato su 'Da inviare'"
                                onClick={() => handleToggleReminderStatus(app)}
                              >
                                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                                <span className="hidden sm:inline">Annulla invio</span>
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant={isSent ? 'outline' : 'default'}
                              className={`h-8 text-xs ${!isSent ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
                              onClick={() => handleQuickSend(app)}
                            >
                              <Send className="mr-1.5 h-3.5 w-3.5" />
                              {isSent ? 'Reinvia' : 'Invia WhatsApp'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nessun appuntamento in programma per {selectedDateLabel}.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* DIALOG INVIO MULTIPLO GUIDATO */}
      <Dialog open={isQueueOpen} onOpenChange={setIsQueueOpen}>
        <DialogContent className="sm:max-w-xl">
          {!queueCompleted ? (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
                    <MessageCircle className="h-4 w-4" />
                    <span>Invio Multiplo Guidato — {selectedDateLabel}</span>
                  </div>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded font-mono font-medium">
                    Cliente {queueIndex + 1} di {queueList.length}
                  </span>
                </div>
                <DialogTitle className="text-xl">
                  {queueList[queueIndex]?.customer?.name || 'Cliente'}
                </DialogTitle>
                <DialogDescription>
                  Verifica il messaggio e clicca su Invia per aprire WhatsApp con la chat del cliente.
                </DialogDescription>
              </DialogHeader>

              {/* Barra di avanzamento */}
              <div className="space-y-1">
                <Progress value={((queueIndex) / queueList.length) * 100} className="h-2" />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Completati: {queueIndex}</span>
                  <span>Rimanenti: {queueList.length - queueIndex}</span>
                </div>
              </div>

              {/* Dettagli appuntamento in lavorazione */}
              {queueList[queueIndex] && (
                <div className="p-3 rounded-lg border bg-muted/40 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Telefono WhatsApp:</span>
                    <span className="font-mono font-semibold">{queueList[queueIndex].customer?.phone || 'Mancante'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data & Orario:</span>
                    <span className="font-medium">
                      {queueList[queueIndex]?.dateTime
                        ? `${format(new Date(queueList[queueIndex].dateTime), 'EEEE d MMMM', { locale: it })}, ore ${format(new Date(queueList[queueIndex].dateTime), 'HH:mm')}`
                        : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trattamenti:</span>
                    <span>
                      {queueList[queueIndex].services?.map((s: Service) => s.name).join(', ') || 'Nessuno'}
                    </span>
                  </div>
                </div>
              )}

              {/* Editor testo per questo cliente */}
              <div className="space-y-2">
                <Label htmlFor="queue-message" className="text-xs font-medium">
                  Messaggio WhatsApp da inviare:
                </Label>
                <Textarea
                  id="queue-message"
                  value={queueCurrentMessage}
                  onChange={(e) => setQueueCurrentMessage(e.target.value)}
                  rows={5}
                  className="text-sm font-sans"
                />
              </div>

              <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground text-xs"
                  onClick={handleQueueSkipCurrent}
                >
                  <SkipForward className="h-3.5 w-3.5 mr-1" />
                  Salta questo cliente
                </Button>

                <Button
                  type="button"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-medium"
                  onClick={handleQueueSendCurrent}
                >
                  <Send className="h-4 w-4" />
                  <span>Apri WhatsApp e Invia</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="py-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-xl">Promemoria Completati!</DialogTitle>
                <DialogDescription>
                  Tutti i clienti selezionati per {selectedDateLabel} sono stati notificati su WhatsApp.
                </DialogDescription>
              </div>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-8"
                onClick={() => {
                  setIsQueueOpen(false);
                  onRefresh?.();
                }}
              >
                Fatto / Chiudi
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
