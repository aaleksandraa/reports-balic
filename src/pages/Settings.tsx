import { Bell, Mail, Shield, Database, Download } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function Settings() {
  const handleSave = () => {
    toast.success('Postavke su sačuvane');
  };

  return (
    <MainLayout>
      <div className="p-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Postavke</h1>
          <p className="text-muted-foreground mt-1">
            Konfiguracija sistema i notifikacija
          </p>
        </div>

        <div className="space-y-6">
          {/* Email Settings */}
          <div className="section-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Email postavke</h3>
                <p className="text-sm text-muted-foreground">Konfiguracija automatskog slanja izvještaja</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Primarni email za izvještaje</label>
                <Input type="email" placeholder="admin@izvjestaji.ba" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Dodatni email (CC)</label>
                <Input type="email" placeholder="direktor@izvjestaji.ba" />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Automatsko slanje na kraju dana</p>
                  <p className="text-sm text-muted-foreground">Izvještaj se šalje automatski u 17:00</p>
                </div>
                <Switch />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="section-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Notifikacije</h3>
                <p className="text-sm text-muted-foreground">Upravljanje obavještenjima</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Podsjetnik za unos izvještaja</p>
                  <p className="text-sm text-muted-foreground">Podsjetnik ako izvještaj nije unesen do 16:00</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Validacija podataka</p>
                  <p className="text-sm text-muted-foreground">Upozorenje ako podaci ne odgovaraju</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="section-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Database className="w-5 h-5 text-info" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Upravljanje podacima</h3>
                <p className="text-sm text-muted-foreground">Backup i export podataka</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">Export svih izvještaja</p>
                  <p className="text-sm text-muted-foreground">Preuzmi sve izvještaje u Excel formatu</p>
                </div>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">Backup baze podataka</p>
                  <p className="text-sm text-muted-foreground">Zadnji backup: Nikada</p>
                </div>
                <Button variant="outline">
                  <Database className="w-4 h-4 mr-2" />
                  Backup
                </Button>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="section-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Sigurnost</h3>
                <p className="text-sm text-muted-foreground">Postavke pristupa i autentifikacije</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground p-4 rounded-lg bg-muted/50">
              Funkcije autentifikacije i upravljanja pristupom zahtijevaju povezivanje sa backend servisom.
              Kontaktirajte administratora za više informacija.
            </p>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} className="gradient-primary">
              Sačuvaj postavke
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
