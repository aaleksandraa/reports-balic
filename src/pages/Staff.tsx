import { useState } from 'react';
import { Users, Building, MapPin, Shield, ShieldCheck, Check } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStaff } from '@/hooks/useStaff';
import { useLocations } from '@/hooks/useLocations';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function Staff() {
  const { staff, isLoading, assignStaffToLocation, removeStaffFromLocation, updateStaffRole, updateStaff } = useStaff();
  const { locations } = useLocations();
  const { isAdmin, user } = useAuth();
  const [editingLocationsId, setEditingLocationsId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });

  const startEdit = (member: any) => {
    setEditingId(member.user_id);
    setEditForm({
      first_name: member.first_name || '',
      last_name: member.last_name || '',
      email: member.email || '',
    });
  };

  const saveEdit = async (userId: string) => {
    try {
      await updateStaff(userId, editForm);
      setEditingId(null);
      toast.success('Korisnik ažuriran');
    } catch (error: any) {
      toast.error(error.message || 'Greška pri ažuriranju');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleLocationToggle = async (userId: string, locationId: string, isAssigned: boolean) => {
    try {
      if (isAssigned) {
        await removeStaffFromLocation(userId, locationId);
        toast.success('Lokacija uklonjena');
      } else {
        await assignStaffToLocation(userId, locationId);
        toast.success('Lokacija dodijeljena');
      }
    } catch (error: any) {
      toast.error(error.message || 'Greška pri dodjeli lokacije');
    }
  };

  const handleRoleChange = async (userId: string, role: 'admin' | 'staff' | 'radnik') => {
    try {
      await updateStaffRole(userId, role);
      const roleLabels = {
        'admin': 'Administrator',
        'staff': 'Osoblje',
        'radnik': 'Radnik'
      };
      toast.success(`Uloga promijenjena u ${roleLabels[role]}`);
    } catch (error: any) {
      toast.error(error.message || 'Greška pri promjeni uloge');
    }
  };

  const activeLocations = locations.filter(l => l.active);

  if (!isAdmin) {
    return (
      <MainLayout>
        <div className="p-8">
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Pristup odbijen</h3>
            <p className="text-muted-foreground">
              Samo administratori mogu upravljati osobljem.
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
              <h1 className="text-3xl font-bold">Upravljanje osobljem</h1>
              <p className="text-muted-foreground mt-1">
                Dodijelite lokacije korisnicima sistema
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-info/10 border border-info/20 mb-6">
            <p className="text-sm text-info">
              <strong>Napomena:</strong> Korisnici koji nisu administratori mogu vidjeti samo lokacije koje su im dodijeljene.
              Administratori mogu vidjeti sve lokacije.
            </p>
          </div>
        </div>

        {/* Staff Table */}
        <div className="section-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Korisnik</th>
                <th>Email</th>
                <th className="w-40">Uloga</th>
                <th>Dodijeljene lokacije</th>
                <th className="w-24"></th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => {
                const isEditingLocations = editingLocationsId === member.user_id;
                const isCurrentUser = member.user_id === user?.id;
                const isEditing = editingId === member.user_id;
                
                return (
                  <tr key={member.id} className={isEditing ? 'bg-accent/30' : ''}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {member.first_name?.[0] || member.email?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="flex-1">
                          {isEditing ? (
                            <div className="flex gap-2">
                              <Input
                                value={editForm.first_name}
                                onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                                placeholder="Ime"
                                className="w-32"
                              />
                              <Input
                                value={editForm.last_name}
                                onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                                placeholder="Prezime"
                                className="w-32"
                              />
                            </div>
                          ) : (
                            <>
                              <p className="font-medium">
                                {member.first_name || member.last_name 
                                  ? `${member.first_name || ''} ${member.last_name || ''}`.trim()
                                  : 'Nepoznat korisnik'}
                              </p>
                              {isCurrentUser && (
                                <span className="text-xs text-muted-foreground">(Vi)</span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="text-muted-foreground">{member.email || '-'}</td>
                    <td>
                      {isCurrentUser ? (
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-primary">Administrator</span>
                        </div>
                      ) : (
                        <Select
                          value={member.role}
                          onValueChange={(value: 'admin' | 'staff' | 'radnik') => handleRoleChange(member.user_id, value)}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">
                              <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" />
                                Administrator
                              </div>
                            </SelectItem>
                            <SelectItem value="staff">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Osoblje
                              </div>
                            </SelectItem>
                            <SelectItem value="radnik">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Radnik
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </td>
                    <td>
                      {member.role === 'admin' ? (
                        <span className="text-sm text-muted-foreground italic">
                          Administratori imaju pristup svim lokacijama
                        </span>
                      ) : isEditingLocations ? (
                        <div className="flex flex-wrap gap-3">
                          {activeLocations.map(loc => {
                            const isAssigned = member.location_ids.includes(loc.id);
                            return (
                              <label 
                                key={loc.id} 
                                className="flex items-center gap-1.5 text-sm cursor-pointer"
                              >
                                <Checkbox
                                  checked={isAssigned}
                                  onCheckedChange={() => handleLocationToggle(member.user_id, loc.id, isAssigned)}
                                />
                                {loc.name}
                              </label>
                            );
                          })}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setEditingLocationsId(null)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Gotovo
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1 items-center">
                          {member.location_ids.length > 0 ? (
                            member.location_ids.map(locId => {
                              const loc = locations.find(l => l.id === locId);
                              return loc ? (
                                <span 
                                  key={locId}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-xs"
                                >
                                  <MapPin className="w-3 h-3" />
                                  {loc.name}
                                </span>
                              ) : null;
                            })
                          ) : (
                            <span className="text-muted-foreground text-sm">Nema dodijeljenih lokacija</span>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-6 px-2 text-xs ml-2"
                            onClick={() => setEditingLocationsId(member.user_id)}
                          >
                            <Building className="w-3 h-3 mr-1" />
                            Uredi
                          </Button>
                        </div>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => saveEdit(member.user_id)}
                          >
                            <Check className="w-4 h-4 text-success" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={cancelEdit}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => startEdit(member)}
                          className="text-muted-foreground hover:text-primary"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {staff.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nema korisnika</h3>
              <p className="text-muted-foreground">
                Korisnici će se pojaviti ovdje kada se registruju
              </p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mt-8">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
            <h4 className="font-medium text-primary mb-1">Administratori</h4>
            <p className="text-2xl font-bold">{staff.filter(s => s.role === 'admin').length}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted border">
            <h4 className="font-medium mb-1">Osoblje</h4>
            <p className="text-2xl font-bold">{staff.filter(s => s.role === 'staff').length}</p>
          </div>
          <div className="p-4 rounded-lg bg-info/5 border border-info/10">
            <h4 className="font-medium text-info mb-1">Radnici</h4>
            <p className="text-2xl font-bold">{staff.filter(s => s.role === 'radnik').length}</p>
          </div>
          <div className="p-4 rounded-lg bg-success/5 border border-success/10">
            <h4 className="font-medium text-success mb-1">Aktivne lokacije</h4>
            <p className="text-2xl font-bold">{activeLocations.length}</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
