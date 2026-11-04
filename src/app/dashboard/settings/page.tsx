'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, PlusCircle, MoreVertical, MessageCircle, CheckCircle2, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase/provider';
import { getSalonProfile, saveSalonProfile, getStaff, saveStaff, deleteStaff, getWhatsAppSettings, saveWhatsAppSettings, defaultWhatsAppSettings } from '@/lib/data';
import type { SalonProfile, Staff, WhatsAppSettings } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StaffForm } from './_components/staff-form';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';


export default function SettingsPage() {
  const { db, isConfigured } = useFirebase();
  const { toast } = useToast();

  const [salonProfile, setSalonProfile] = useState<SalonProfile>({
    name: 'Salone Carmelinda',
    address: 'Via Roma, 1, 00184 Roma RM, Italia',
    phone: '+39 06 1234567',
    email: 'contatti@carmelindasalon.it',
  });
  
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isStaffFormOpen, setIsStaffFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | undefined>(undefined);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [stockAlerts, setStockAlerts] = useState(true);

  const [whatsappSettings, setWhatsappSettings] = useState<WhatsAppSettings>(defaultWhatsAppSettings);
  const [isSavingWhatsapp, setIsSavingWhatsapp] = useState(false);

  const fetchData = useCallback(async () => {
    if (!isConfigured || !db) return;
    setIsLoading(true);
    try {
      const [profile, staffData, waSettings] = await Promise.all([
        getSalonProfile(db),
        getStaff(db),
        getWhatsAppSettings(db)
      ]);
      if (profile) {
        setSalonProfile(profile);
      }
      setStaff(staffData);
      if (waSettings) {
        setWhatsappSettings(waSettings);
      }
    } catch (error) {
      console.error("Failed to fetch settings data:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i dati delle impostazioni.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [db, isConfigured, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleProfileSave = () => {
    if (!db) return;
    setIsSaving(true);
    saveSalonProfile(db, salonProfile);
    toast({
      title: 'Profilo salvato!',
      description: 'Le informazioni del salone sono state aggiornate.',
    });
    setIsSaving(false);
  };

  const handleNotificationsSave = () => {
     console.log('Salvataggio preferenze notifiche:', { emailNotifications, stockAlerts });
    toast({
      title: 'Preferenze salvate!',
      description: 'Le impostazioni di notifica sono state aggiornate.',
    });
  };

  const handleWhatsAppSave = () => {
    if (!db) return;
    setIsSavingWhatsapp(true);
    saveWhatsAppSettings(db, whatsappSettings);
    toast({
      title: 'Impostazioni WhatsApp salvate!',
      description: 'Il testo standard e le preferenze per i promemoria sono state aggiornate con successo.',
    });
    setIsSavingWhatsapp(false);
  };

  const insertPlaceholder = (tag: string) => {
    setWhatsappSettings(prev => ({
      ...prev,
      template: prev.template ? `${prev.template} ${tag}` : tag
    }));
  };

  const getPreviewText = () => {
    return whatsappSettings.template
      .replace(/{nome}/g, 'Chiara Rossi')
      .replace(/{salone}/g, salonProfile.name || 'Salone Carmelinda')
      .replace(/{data}/g, 'Giovedì 12 Novembre')
      .replace(/{ora}/g, '15:30')
      .replace(/{servizi}/g, 'Taglio Donna, Piega');
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSalonProfile(prev => ({ ...prev, [id]: value }));
  };

  const handleNewStaff = () => {
    setEditingStaff(undefined);
    setIsStaffFormOpen(true);
  };

  const handleEditStaff = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setIsStaffFormOpen(true);
  };

  const handleDeleteStaff = (staffId: string) => {
    if (!db) return;
    deleteStaff(db, staffId);
    toast({
        title: "Membro dello staff eliminato",
        description: "Il membro dello staff è stato eliminato con successo.",
        variant: "destructive",
    });
    setTimeout(() => fetchData(), 500);
    setIsStaffFormOpen(false);
  };

  const handleStaffFormSave = (staffMember: Omit<Staff, 'id'> & { id?: string }) => {
    if (!db) return;
    saveStaff(db, staffMember);
    toast({
        title: "Salvataggio in corso...",
        description: "I dati dello staff sono in fase di salvataggio.",
    });
    setTimeout(() => fetchData(), 500);
    setIsStaffFormOpen(false);
  };

  return (
    <div className="space-y-8">
      <PageHeader title="Impostazioni" description="Gestisci la configurazione e le preferenze del tuo salone." />

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full max-w-xl grid-cols-2 sm:grid-cols-4 h-auto p-1.5 gap-1.5">
          <TabsTrigger value="profile" className="py-2.5 text-xs sm:text-sm">Profilo</TabsTrigger>
          <TabsTrigger value="staff" className="py-2.5 text-xs sm:text-sm">Stilisti</TabsTrigger>
          <TabsTrigger value="notifications" className="py-2.5 text-xs sm:text-sm">Notifiche</TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm">
            <MessageCircle className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>WhatsApp</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profilo Salone</CardTitle>
              <CardDescription>Aggiorna le informazioni pubbliche del tuo salone.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Salone</Label>
                    <Input id="name" value={salonProfile.name} onChange={handleProfileChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Indirizzo</Label>
                    <Input id="address" value={salonProfile.address} onChange={handleProfileChange} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Numero di Telefono</Label>
                      <Input id="phone" value={salonProfile.phone} onChange={handleProfileChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={salonProfile.email} onChange={handleProfileChange} />
                    </div>
                  </div>
                  <Button className="mt-4" onClick={handleProfileSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                    Salva Modifiche
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff">
            <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle>Gestione Stilisti</CardTitle>
                        <CardDescription>Aggiungi, modifica o rimuovi membri dello staff.</CardDescription>
                    </div>
                    <Button onClick={handleNewStaff} disabled={!isConfigured}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Aggiungi Stilista
                    </Button>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Ruolo</TableHead>
                                <TableHead className="text-right">Azioni</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {staff.map((staffMember) => (
                                <TableRow key={staffMember.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarFallback>{staffMember.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{staffMember.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={staffMember.role === 'Manager' ? 'default' : 'secondary'}>
                                            {staffMember.role}
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
                                                <DropdownMenuItem onClick={() => handleEditStaff(staffMember)}>
                                                    Modifica
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDeleteStaff(staffMember.id)} className="text-destructive">
                                                    Elimina
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Impostazioni Notifiche</CardTitle>
              <CardDescription>Gestisci come ricevi le notifiche.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
                    <div className="space-y-0.5">
                        <Label htmlFor="email-notifications" className="text-base">Notifiche Email</Label>
                        <p className="text-sm text-muted-foreground">Ricevi un'email per nuovi appuntamenti e cancellazioni.</p>
                    </div>
                    <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>
                <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
                    <div className="space-y-0.5">
                        <Label htmlFor="stock-alerts" className="text-base">Avvisi Scorte Basse</Label>
                        <p className="text-sm text-muted-foreground">Ricevi una notifica quando i livelli di stock dei prodotti sono bassi.</p>
                    </div>
                    <Switch id="stock-alerts" checked={stockAlerts} onCheckedChange={setStockAlerts} />
                </div>
                <Button className="mt-4" onClick={handleNotificationsSave}>
                    <Save className="mr-2 h-4 w-4"/>
                    Salva Preferenze
                </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Promemoria WhatsApp ai Clienti</CardTitle>
                  <CardDescription>
                    Configura il testo standard e l'orario di invio dei messaggi automatici per gli appuntamenti.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Abilitazione */}
              <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg bg-card">
                <div className="space-y-0.5">
                  <Label htmlFor="whatsapp-enabled" className="text-base font-medium">
                    Abilita Promemoria Automatici
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    I clienti riceveranno un promemoria prima del loro appuntamento.
                  </p>
                </div>
                <Switch
                  id="whatsapp-enabled"
                  checked={whatsappSettings.enabled}
                  onCheckedChange={(checked) =>
                    setWhatsappSettings((prev) => ({ ...prev, enabled: checked }))
                  }
                />
              </div>

              {/* Orario e Tempistiche */}
              <div className="p-4 border rounded-lg space-y-4 bg-card">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2 font-medium">
                    <Clock className="h-4 w-4 text-primary shrink-0" />
                    <span>Quando inviare i promemoria</span>
                  </div>
                  <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-md font-medium w-fit">
                    {whatsappSettings.timingType === '1_hour' && '1 ora prima'}
                    {whatsappSettings.timingType === '2_hours' && '2 ore prima'}
                    {whatsappSettings.timingType === '3_hours' && '3 ore prima'}
                    {whatsappSettings.timingType === 'custom_hours' && `${whatsappSettings.customHours || 4} ore prima`}
                    {(whatsappSettings.timingType === '1_day' || whatsappSettings.timingType === 'day_before') && `1 giorno prima alle ${whatsappSettings.sendTime || '09:00'}`}
                    {whatsappSettings.timingType === '2_days' && `2 giorni prima alle ${whatsappSettings.sendTime || '09:00'}`}
                    {whatsappSettings.timingType === 'custom_days' && `${whatsappSettings.customDays || 3} giorni prima alle ${whatsappSettings.sendTime || '09:00'}`}
                    {whatsappSettings.timingType === 'hours_before' && `${whatsappSettings.hoursBefore || 24} ore prima`}
                  </span>
                </div>

                {/* Selezione Rapida con Pulsanti Preset */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase font-semibold">
                    Scegli l'anticipo desiderato:
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    {[
                      { key: '1_hour', label: '1 ora prima', icon: '⚡' },
                      { key: '2_hours', label: '2 ore prima', icon: '⚡' },
                      { key: '3_hours', label: '3 ore prima', icon: '⚡' },
                      { key: '1_day', label: '1 giorno prima', icon: '📅' },
                      { key: '2_days', label: '2 giorni prima', icon: '📅' },
                      { key: 'custom_hours', label: 'Ore personalizzate', icon: '⚙️' },
                    ].map((item) => {
                      const isSelected =
                        whatsappSettings.timingType === item.key ||
                        (item.key === '1_day' && whatsappSettings.timingType === 'day_before');
                      return (
                        <Button
                          key={item.key}
                          type="button"
                          variant={isSelected ? 'default' : 'outline'}
                          size="sm"
                          className="h-auto min-h-[44px] py-2 px-2 text-xs flex flex-row sm:flex-col items-center justify-center gap-1.5 leading-tight whitespace-normal text-center"
                          onClick={() =>
                            setWhatsappSettings((prev) => ({
                              ...prev,
                              timingType: item.key as any,
                            }))
                          }
                        >
                          <span className="text-sm shrink-0">{item.icon}</span>
                          <span className="font-medium text-center">{item.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Dettagli configurazione in base alla scelta */}
                <div className="p-3 bg-muted/40 rounded-md border space-y-3">
                  {(whatsappSettings.timingType === '1_day' ||
                    whatsappSettings.timingType === '2_days' ||
                    whatsappSettings.timingType === 'custom_days' ||
                    whatsappSettings.timingType === 'day_before') && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {whatsappSettings.timingType === 'custom_days' && (
                        <div className="space-y-1.5">
                          <Label htmlFor="custom-days" className="text-xs">Giorni di anticipo:</Label>
                          <Input
                            id="custom-days"
                            type="number"
                            min="1"
                            max="14"
                            value={whatsappSettings.customDays || 3}
                            onChange={(e) =>
                              setWhatsappSettings((prev) => ({
                                ...prev,
                                customDays: parseInt(e.target.value, 10) || 1,
                              }))
                            }
                          />
                        </div>
                      )}
                      <div className="space-y-1.5">
                        <Label htmlFor="send-time" className="text-xs">Orario esatto di invio:</Label>
                        <Input
                          id="send-time"
                          type="time"
                          value={whatsappSettings.sendTime || '09:00'}
                          onChange={(e) =>
                            setWhatsappSettings((prev) => ({ ...prev, sendTime: e.target.value }))
                          }
                        />
                        <p className="text-[11px] text-muted-foreground">
                          Il promemoria partirà a quest'ora esatta del giorno prestabilito.
                        </p>
                      </div>
                    </div>
                  )}

                  {whatsappSettings.timingType === 'custom_hours' && (
                    <div className="space-y-1.5 max-w-xs">
                      <Label htmlFor="custom-hours" className="text-xs">Quante ore prima dell'appuntamento?</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="custom-hours"
                          type="number"
                          min="1"
                          max="72"
                          value={whatsappSettings.customHours || 4}
                          onChange={(e) =>
                            setWhatsappSettings((prev) => ({
                              ...prev,
                              customHours: parseInt(e.target.value, 10) || 1,
                            }))
                          }
                        />
                        <span className="text-sm text-muted-foreground whitespace-nowrap">ore prima</span>
                      </div>
                    </div>
                  )}

                  {(whatsappSettings.timingType === '1_hour' ||
                    whatsappSettings.timingType === '2_hours' ||
                    whatsappSettings.timingType === '3_hours') && (
                    <p className="text-xs text-muted-foreground">
                      💡 Il promemoria verrà calcolato automaticamente in base all'orario dell'appuntamento del cliente (es: appuntamento alle 16:00, invio alle{' '}
                      {whatsappSettings.timingType === '1_hour' ? '15:00' : whatsappSettings.timingType === '2_hours' ? '14:00' : '13:00'}).
                    </p>
                  )}
                </div>
              </div>

              {/* Editor del Testo Standard */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="whatsapp-template" className="text-base font-medium">
                    Testo Standard del Messaggio
                  </Label>
                </div>
                <Textarea
                  id="whatsapp-template"
                  rows={4}
                  value={whatsappSettings.template}
                  onChange={(e) =>
                    setWhatsappSettings((prev) => ({ ...prev, template: e.target.value }))
                  }
                  placeholder="Scrivi qui il messaggio predefinito per i clienti..."
                  className="font-sans text-sm"
                />
                
                {/* Segnaposto cliccabili */}
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">
                    Clicca su una variabile per inserirla nel messaggio:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { tag: '{nome}', desc: 'Nome cliente' },
                      { tag: '{data}', desc: 'Data appuntamento' },
                      { tag: '{ora}', desc: 'Orario' },
                      { tag: '{servizi}', desc: 'Trattamenti' },
                      { tag: '{salone}', desc: 'Nome salone' },
                    ].map((item) => (
                      <Button
                        key={item.tag}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs font-mono"
                        onClick={() => insertPlaceholder(item.tag)}
                      >
                        <span className="text-primary font-semibold">{item.tag}</span>
                        <span className="ml-1 text-[11px] text-muted-foreground">({item.desc})</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Anteprima Live */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Anteprima Messaggio (come lo vedrà il cliente):</Label>
                <div className="p-4 rounded-xl border bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-full bg-emerald-500 text-white shrink-0 mt-0.5">
                      <MessageCircle className="h-4 w-4" />
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold text-emerald-900 dark:text-emerald-200">
                        {salonProfile.name || 'CMparrucchieri'}
                      </p>
                      <p className="whitespace-pre-wrap text-foreground/90">
                        {getPreviewText() || 'Nessun messaggio impostato.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informazione cliente */}
              <div className="flex items-center gap-2 p-3 rounded-md bg-muted/60 text-xs text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Nota per i clienti:</strong> I clienti ricevono il messaggio direttamente sul loro normale WhatsApp dal tuo numero. Non hanno bisogno di alcuna app o registrazione.
                </span>
              </div>

              {/* Bottone Salvataggio */}
              <Button
                className="mt-2"
                onClick={handleWhatsAppSave}
                disabled={isSavingWhatsapp}
              >
                {isSavingWhatsapp ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salva Impostazioni WhatsApp
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {isStaffFormOpen && (
        <StaffForm
            isOpen={isStaffFormOpen}
            onClose={() => setIsStaffFormOpen(false)}
            onSave={handleStaffFormSave}
            onDelete={handleDeleteStaff}
            staffMember={editingStaff}
        />
      )}
    </div>
  );
}
