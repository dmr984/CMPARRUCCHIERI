'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { toast } = useToast();

  // State for Profile settings
  const [salonName, setSalonName] = useState('Salone Carmelinda');
  const [salonAddress, setSalonAddress] = useState('Via Roma, 1, 00184 Roma RM, Italia');
  const [salonPhone, setSalonPhone] = useState('+39 06 1234567');
  const [salonEmail, setSalonEmail] = useState('contatti@carmelindasalon.it');

  // State for Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [stockAlerts, setStockAlerts] = useState(true);
  
  const handleProfileSave = () => {
    // In a real app, you would save this data to your backend.
    console.log('Salvataggio profilo:', { salonName, salonAddress, salonPhone, salonEmail });
    toast({
      title: 'Profilo salvato!',
      description: 'Le informazioni del salone sono state aggiornate.',
    });
  };

  const handleNotificationsSave = () => {
    // In a real app, you would save these preferences to your backend.
     console.log('Salvataggio preferenze notifiche:', { emailNotifications, stockAlerts });
    toast({
      title: 'Preferenze salvate!',
      description: 'Le impostazioni di notifica sono state aggiornate.',
    });
  };


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
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="salon-name">Nome Salone</Label>
                <Input id="salon-name" value={salonName} onChange={(e) => setSalonName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salon-address">Indirizzo</Label>
                <Input id="salon-address" value={salonAddress} onChange={(e) => setSalonAddress(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salon-phone">Numero di Telefono</Label>
                  <Input id="salon-phone" value={salonPhone} onChange={(e) => setSalonPhone(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salon-email">Email</Label>
                  <Input id="salon-email" type="email" value={salonEmail} onChange={(e) => setSalonEmail(e.target.value)} />
                </div>
              </div>
              <Button className="mt-4" onClick={handleProfileSave}>
                <Save className="mr-2 h-4 w-4"/>
                Salva Modifiche
              </Button>
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
