import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Save } from 'lucide-react';

export default function SettingsPage() {
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
                <Input id="salon-name" defaultValue="Salone Carmelinda" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salon-address">Indirizzo</Label>
                <Input id="salon-address" defaultValue="Via Roma, 1, 00184 Roma RM, Italia" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salon-phone">Numero di Telefono</Label>
                  <Input id="salon-phone" defaultValue="+39 06 1234567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salon-email">Email</Label>
                  <Input id="salon-email" type="email" defaultValue="contatti@carmelindasalon.it" />
                </div>
              </div>
              <Button className="mt-4">
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
                    <Switch id="email-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
                    <div className="space-y-0.5">
                        <Label htmlFor="stock-alerts" className="text-base">Avvisi Scorte Basse</Label>
                        <p className="text-sm text-muted-foreground">Ricevi una notifica quando i livelli di stock dei prodotti sono bassi.</p>
                    </div>
                    <Switch id="stock-alerts" defaultChecked />
                </div>
                <Button className="mt-4">
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
