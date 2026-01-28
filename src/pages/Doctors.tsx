import { useState } from 'react';
import { Plus, Trash2, Check, X, UserPlus, Building, MapPin } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useDoctors } from '@/hooks/useDoctors';
import { useLocations } from '@/hooks/useLocations';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function Doctors() {
  const { doctors, isLoading, addDoctor, updateDoctor, deleteDoctor, getDoctorLocations, assignDoctorToLocation, removeDoctorFromLocation } = useDoctors();
  const { locations } = useLocations();
  const { isAdmin } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLocationsId, setEditingLocationsId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    initials: '',
    email: '',
    role: 'doctor' as 'doctor' | 'associate' | 'staff',
  });
  const [newDoctor, setNewDoctor] = useState({
    first_name: '',
    last_name: '',
    initials: '',
    email: '',
    role: 'doctor' as 'doctor' | 'associate' | 'staff',
    active: true,
  });

  const generateInitials = (firstName: string, lastName: string) => {
    const first = firstName.trim()[0] || '';
    const last = lastName.trim()[0] || '';
    return (first + last).toUpperCase();
  };

  const handleNewDoctorChange = (field: string, value: string) => {
    const updated = { ...newDoctor, [field]: value };
    if (field === 'first_name' || field === 'last_name') {
      updated.initials = generateInitials(updated.first_name, updated.last_name);
    }
    setNewDoctor(updated);
  };

  const handleEditFormChange = (field: string, value: string) => {
    const updated = { ...editForm, [field]: value };
    if (field === 'first_name' || field === 'last_name') {
      updated.initials = generateInitials(updated.first_name, updated.last_name);
    }
    setEditForm(updated);
  };

  const startEdit = (doctor: any) => {
    setEditingId(doctor.id);
    setEditForm({
      first_name: doctor.first_name,
      last_name: doctor.last_name,
      initials: doctor.initials,
      email: doctor.email || '',
      role: doctor.role,
    });
  };

  const saveEdit = async (id: string) => {
    try {
      await updateDoctor(id, editForm);
      setEditingId(null);
      toast.success('Doktor ažuriran');
    } catch (error: any) {
      toast.error(error.message || 'Greška pri ažuriranju');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleAdd = async () => {
    if (!newDoctor.first_name || !newDoctor.initials) {
      toast.error('Unesite ime i inicijale');
      return;
    }
    try {
      await addDoctor(newDoctor);
      setNewDoctor({
        first_name: '',
        last_name: '',
        initials: '',
        email: '',
        role: 'doctor',
        active: true,
      });
      setIsAdding(false);
      toast.success('Doktor je uspješno dodan');
    } catch (error: any) {
      toast.error(error.message || 'Greška pri dodavanju');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoctor(id);
      toast.success('Doktor je uklonjen');
    } catch (error: any) {
      toast.error(error.message || 'Greška pri brisanju');
    }
  };

  const handleLocationToggle = async (doctorId: string, locationId: string, isAssigned: boolean) => {
    try {
      if (isAssigned) {
        await removeDoctorFromLocation(doctorId, locationId);
      } else {
        await assignDoctorToLocation(doctorId, locationId);
      }
    } catch (error: any) {
      toast.error(error.message || 'Greška pri dodjeli lokacije');
    }
  };

  const roleLabels: Record<string, string> = {
    doctor: 'Doktor',
    associate: 'Saradnik',
    staff: 'Osoblje',
  };

  const activeLocations = locations.filter(l => l.active);

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Doktori i saradnici</h1>
              <p className="text-muted-foreground mt-1">
                Upravljanje doktorima i saradnicima sa lokacijama
              </p>
            </div>
            {isAdmin && (
              <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
                <UserPlus className="w-4 h-4 mr-2" />
                Dodaj osobu
              </Button>
            )}
          </div>
        </div>

        {/* Doctors Table */}
        <div className="section-card">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-12">Inicijali</th>
                <th>Ime</th>
                <th>Prezime</th>
                <th className="w-32">Uloga</th>
                <th>Lokacije</th>
                <th className="w-24 text-center">Aktivan</th>
                {isAdmin && <th className="w-24"></th>}
              </tr>
            </thead>
            <tbody>
              {/* Add new row */}
              {isAdding && (
                <tr className="bg-accent/30">
                  <td>
                    <Input
                      value={newDoctor.initials}
                      onChange={(e) => setNewDoctor({ ...newDoctor, initials: e.target.value.toUpperCase() })}
                      placeholder="AB"
                      maxLength={3}
                      className="w-16"
                    />
                  </td>
                  <td>
                    <Input
                      value={newDoctor.first_name}
                      onChange={(e) => handleNewDoctorChange('first_name', e.target.value)}
                      placeholder="Ime"
                    />
                  </td>
                  <td>
                    <Input
                      value={newDoctor.last_name}
                      onChange={(e) => handleNewDoctorChange('last_name', e.target.value)}
                      placeholder="Prezime"
                    />
                  </td>
                  <td>
                    <Select
                      value={newDoctor.role}
                      onValueChange={(value: 'doctor' | 'associate' | 'staff') =>
                        setNewDoctor({ ...newDoctor, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="doctor">Doktor</SelectItem>
                        <SelectItem value="associate">Saradnik</SelectItem>
                        <SelectItem value="staff">Osoblje</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="text-sm text-muted-foreground">
                    Prvo dodajte, pa dodijelite lokacije
                  </td>
                  <td className="text-center">
                    <Switch
                      checked={newDoctor.active}
                      onCheckedChange={(checked) => setNewDoctor({ ...newDoctor, active: checked })}
                    />
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={handleAdd}>
                        <Check className="w-4 h-4 text-success" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setIsAdding(false)}>
                        <X className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )}

              {/* Existing doctors */}
              {doctors.map((doctor) => {
                const doctorLocationIds = getDoctorLocations(doctor.id);
                const isEditingLocations = editingLocationsId === doctor.id;
                const isEditing = editingId === doctor.id;
                
                return (
                  <tr key={doctor.id} className={isEditing ? 'bg-accent/30' : ''}>
                    <td>
                      {isEditing ? (
                        <Input
                          value={editForm.initials}
                          onChange={(e) => setEditForm({ ...editForm, initials: e.target.value.toUpperCase() })}
                          placeholder="AB"
                          maxLength={3}
                          className="w-16"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">{doctor.initials}</span>
                        </div>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <Input
                          value={editForm.first_name}
                          onChange={(e) => handleEditFormChange('first_name', e.target.value)}
                          placeholder="Ime"
                        />
                      ) : (
                        <span className="font-medium">{doctor.first_name}</span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <Input
                          value={editForm.last_name}
                          onChange={(e) => handleEditFormChange('last_name', e.target.value)}
                          placeholder="Prezime"
                        />
                      ) : (
                        <span>{doctor.last_name}</span>
                      )}
                    </td>
                    <td>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        doctor.role === 'doctor' 
                          ? 'bg-primary/10 text-primary'
                          : doctor.role === 'associate'
                          ? 'bg-associates-light text-associates'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {roleLabels[doctor.role]}
                      </span>
                    </td>
                    <td>
                      {isEditingLocations ? (
                        <div className="flex flex-wrap gap-2">
                          {activeLocations.map(loc => {
                            const isAssigned = doctorLocationIds.includes(loc.id);
                            return (
                              <label 
                                key={loc.id} 
                                className="flex items-center gap-1.5 text-sm cursor-pointer"
                              >
                                <Checkbox
                                  checked={isAssigned}
                                  onCheckedChange={() => handleLocationToggle(doctor.id, loc.id, isAssigned)}
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
                            <Check className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {doctorLocationIds.length > 0 ? (
                            doctorLocationIds.map(locId => {
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
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                          {isAdmin && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() => setEditingLocationsId(doctor.id)}
                            >
                              <Building className="w-3 h-3 mr-1" />
                              Uredi
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="text-center">
                      <Switch
                        checked={doctor.active}
                        onCheckedChange={(checked) => updateDoctor(doctor.id, { active: checked })}
                        disabled={!isAdmin}
                      />
                    </td>
                    {isAdmin && (
                      <td>
                        <div className="flex items-center gap-1">
                          {isEditing ? (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => saveEdit(doctor.id)}
                              >
                                <Check className="w-4 h-4 text-success" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={cancelEdit}
                              >
                                <X className="w-4 h-4 text-destructive" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => startEdit(doctor)}
                                className="text-muted-foreground hover:text-primary"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDelete(doctor.id)}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {doctors.length === 0 && !isLoading && !isAdding && (
            <div className="text-center py-12">
              <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nema doktora</h3>
              <p className="text-muted-foreground">Dodajte prvog doktora da biste započeli</p>
            </div>
          )}
        </div>

        {/* Info cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
            <h4 className="font-medium text-primary mb-1">Doktori</h4>
            <p className="text-2xl font-bold">{doctors.filter(d => d.role === 'doctor').length}</p>
            <p className="text-sm text-muted-foreground">Aktivnih: {doctors.filter(d => d.role === 'doctor' && d.active).length}</p>
          </div>
          <div className="p-4 rounded-lg bg-associates-light border border-associates/10">
            <h4 className="font-medium text-associates mb-1">Saradnici</h4>
            <p className="text-2xl font-bold">{doctors.filter(d => d.role === 'associate').length}</p>
            <p className="text-sm text-muted-foreground">Aktivnih: {doctors.filter(d => d.role === 'associate' && d.active).length}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted border">
            <h4 className="font-medium mb-1">Osoblje (kliničko)</h4>
            <p className="text-2xl font-bold">{doctors.filter(d => d.role === 'staff').length}</p>
            <p className="text-sm text-muted-foreground">Aktivnih: {doctors.filter(d => d.role === 'staff' && d.active).length}</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
