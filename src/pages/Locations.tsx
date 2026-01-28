import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, MapPin, Building } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useLocations, Location } from '@/hooks/useLocations';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function Locations() {
  const { locations, isLoading, addLocation, updateLocation, deleteLocation } = useLocations();
  const { isAdmin } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newLocation, setNewLocation] = useState<Omit<Location, 'id' | 'created_at'>>({
    name: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    active: true,
  });
  const [editLocation, setEditLocation] = useState<Partial<Location>>({});

  const handleAdd = async () => {
    if (!newLocation.name) {
      toast.error('Unesite naziv lokacije');
      return;
    }
    try {
      await addLocation(newLocation);
      setNewLocation({
        name: '',
        address: '',
        city: '',
        phone: '',
        email: '',
        active: true,
      });
      setIsAdding(false);
      toast.success('Lokacija je uspješno dodana');
    } catch (error: any) {
      toast.error(error.message || 'Greška pri dodavanju lokacije');
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await updateLocation(id, editLocation);
      setEditingId(null);
      setEditLocation({});
      toast.success('Lokacija je ažurirana');
    } catch (error: any) {
      toast.error(error.message || 'Greška pri ažuriranju');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLocation(id);
      toast.success('Lokacija je uklonjena');
    } catch (error: any) {
      toast.error(error.message || 'Greška pri brisanju');
    }
  };

  const startEditing = (location: Location) => {
    setEditingId(location.id);
    setEditLocation(location);
  };

  if (!isAdmin) {
    return (
      <MainLayout>
        <div className="p-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Samo administratori mogu upravljati lokacijama.
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Lokacije</h1>
              <p className="text-muted-foreground mt-1">
                Upravljanje klinikama i lokacijama
              </p>
            </div>
            <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
              <Plus className="w-4 h-4 mr-2" />
              Dodaj lokaciju
            </Button>
          </div>
        </div>

        {/* Locations Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add new card */}
          {isAdding && (
            <div className="section-card p-6 border-2 border-dashed border-primary/30">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Naziv *</label>
                  <Input
                    value={newLocation.name}
                    onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                    placeholder="Naziv lokacije"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Adresa</label>
                  <Input
                    value={newLocation.address || ''}
                    onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                    placeholder="Adresa"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Grad</label>
                    <Input
                      value={newLocation.city || ''}
                      onChange={(e) => setNewLocation({ ...newLocation, city: e.target.value })}
                      placeholder="Grad"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Telefon</label>
                    <Input
                      value={newLocation.phone || ''}
                      onChange={(e) => setNewLocation({ ...newLocation, phone: e.target.value })}
                      placeholder="Telefon"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Email</label>
                  <Input
                    type="email"
                    value={newLocation.email || ''}
                    onChange={(e) => setNewLocation({ ...newLocation, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newLocation.active}
                      onCheckedChange={(checked) => setNewLocation({ ...newLocation, active: checked })}
                    />
                    <span className="text-sm">Aktivna</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                    <Button size="sm" onClick={handleAdd}>
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Existing locations */}
          {locations.map((location) => (
            <div 
              key={location.id} 
              className={`section-card p-6 ${!location.active ? 'opacity-60' : ''}`}
            >
              {editingId === location.id ? (
                <div className="space-y-4">
                  <Input
                    value={editLocation.name || ''}
                    onChange={(e) => setEditLocation({ ...editLocation, name: e.target.value })}
                    placeholder="Naziv"
                  />
                  <Input
                    value={editLocation.address || ''}
                    onChange={(e) => setEditLocation({ ...editLocation, address: e.target.value })}
                    placeholder="Adresa"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={editLocation.city || ''}
                      onChange={(e) => setEditLocation({ ...editLocation, city: e.target.value })}
                      placeholder="Grad"
                    />
                    <Input
                      value={editLocation.phone || ''}
                      onChange={(e) => setEditLocation({ ...editLocation, phone: e.target.value })}
                      placeholder="Telefon"
                    />
                  </div>
                  <Input
                    value={editLocation.email || ''}
                    onChange={(e) => setEditLocation({ ...editLocation, email: e.target.value })}
                    placeholder="Email"
                  />
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={editLocation.active}
                        onCheckedChange={(checked) => setEditLocation({ ...editLocation, active: checked })}
                      />
                      <span className="text-sm">Aktivna</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                      <Button size="sm" onClick={() => handleUpdate(location.id)}>
                        <Check className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Building className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{location.name}</h3>
                        {location.city && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {location.city}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      location.active 
                        ? 'bg-success/10 text-success' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {location.active ? 'Aktivna' : 'Neaktivna'}
                    </div>
                  </div>
                  
                  {location.address && (
                    <p className="text-sm text-muted-foreground mb-2">{location.address}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-4">
                    {location.phone && <span>📞 {location.phone}</span>}
                    {location.email && <span>✉️ {location.email}</span>}
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => startEditing(location)}
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Uredi
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(location.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {locations.length === 0 && !isAdding && !isLoading && (
          <div className="text-center py-12">
            <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nema lokacija</h3>
            <p className="text-muted-foreground mb-4">
              Dodajte prvu lokaciju da biste započeli
            </p>
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Dodaj lokaciju
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
