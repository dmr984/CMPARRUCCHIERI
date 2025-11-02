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
      <PageHeader title="Settings" description="Manage your salon's configuration and preferences." />

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Salon Profile</CardTitle>
              <CardDescription>Update your salon's public information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="salon-name">Salon Name</Label>
                <Input id="salon-name" defaultValue="Carmelinda Salon Manager" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salon-address">Address</Label>
                <Input id="salon-address" defaultValue="Via Roma, 1, 00184 Roma RM, Italy" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salon-phone">Phone Number</Label>
                  <Input id="salon-phone" defaultValue="+39 06 1234567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salon-email">Email</Label>
                  <Input id="salon-email" type="email" defaultValue="contatti@carmelindasalon.it" />
                </div>
              </div>
              <Button className="mt-4">
                <Save className="mr-2 h-4 w-4"/>
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
            <Card>
                <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage who has access to your salon dashboard.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">User management functionality coming soon.</p>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
                    <div className="space-y-0.5">
                        <Label htmlFor="email-notifications" className="text-base">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive an email for new appointments and cancellations.</p>
                    </div>
                    <Switch id="email-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
                    <div className="space-y-0.5">
                        <Label htmlFor="stock-alerts" className="text-base">Low Stock Alerts</Label>
                        <p className="text-sm text-muted-foreground">Get notified when product stock levels are low.</p>
                    </div>
                    <Switch id="stock-alerts" defaultChecked />
                </div>
                <Button className="mt-4">
                    <Save className="mr-2 h-4 w-4"/>
                    Save Preferences
                </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
