'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase/provider';
import { getSalonProfile, saveSalonProfile } from '@/lib/data';
import type { SalonProfile } from '@/lib/types';

export default function SettingsPage() {
  const { db, isConfigured } = useFirebase();
  const { toast } = useToast();

  // State for Profile settings
  const [salonProfile, setSalonProfile] = useState<SalonProfile>({
    name: 'Salone Carmelinda',
    address: 'Via Roma, 1, 00184 Roma RM, Italia',
    phone: '+39 06 1234567',
    email: 'contatti@carmelindasalon.it',
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // State for Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [stockAlerts, setStockAlerts] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!isConfigured || !db) return;
    setIsLoading(true);
    try {
      const profile = await getSalonProfile(db);
      if (profile) {
        setSalonProfile(profile);
      }
    } catch (error) {
      console.error("Failed to fetch salon profile:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare il profilo del salone.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [db, isConfigured, toast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);
  
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
    // In a real app, you would save these preferences to your backend.
     console.log('Salvataggio preferenze notifiche:', { emailNotifications, stockAlerts });
    toast({
      title: 'Preferenze salvate!',
      description: 'Le impostazioni di notifica sono state aggiornate.',
    });
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSalonProfile(prev => ({ ...prev, [id]: value }));
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Impostazioni" description="Gestisci la configurazione e le preferenze del tuo salone." />

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="profile">Profilo</TabsTrigger>
          <TabsTrigger value="users">Utenti</TabsTrigger>
          <TabsTrigger value="notifications">Notifiche</TabsTrigger>
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

        <TabsContent value="users">
            <Card>
                <CardHeader>
                    <CardTitle>Gestione Utenti</CardTitle>
                    <CardDescription>Gestisci chi ha accesso alla dashboard del tuo salone.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">La funzionalità di gestione degli utenti sarà presto disponibile.</p>
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
      </Tabs>
    </div>
  );
}
