import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useEmployees, Employee } from '@/hooks/useEmployees';
import { useLocations } from '@/hooks/useLocations';
import { WorkHoursStats } from '@/components/employees/WorkHoursStats';
import { toast } from 'sonner';

export default function Employees() {
  const { employees, loading, createEmployee, updateEmployee, deleteEmployee, assignEmployeeToLocation, removeEmployeeFromLocation } = useEmployees();
  const { locations } = useLocations();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [expandedEmployeeId, setExpandedEmployeeId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    job_title: '',
    daily_work_hours: '8',
    weekly_work_hours: '40',
    monthly_work_hours: '160',
  });

  const handleFormChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, {
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          job_title: formData.job_title,
          daily_work_hours: parseFloat(formData.daily_work_hours),
          weekly_work_hours: parseFloat(formData.weekly_work_hours),
          monthly_work_hours: parseFloat(formData.monthly_work_hours),
        });
        toast.success('Radnik ažuriran');
      } else {
        await createEmployee({
          ...formData,
          daily_work_hours: parseFloat(formData.daily_work_hours),
          weekly_work_hours: parseFloat(formData.weekly_work_hours),
          monthly_work_hours: parseFloat(formData.monthly_work_hours),
        });
        toast.success('Radnik kreiran');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Greška');
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      email: employee.email,
      password: '',
      first_name: employee.first_name,
      last_name: employee.last_name,
      job_title: employee.job_title,
      daily_work_hours: employee.daily_work_hours?.toString() || '8',
      weekly_work_hours: employee.weekly_work_hours?.toString() || '40',
      monthly_work_hours: employee.monthly_work_hours?.toString() || '160',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Da li ste sigurni da želite obrisati ovog radnika?')) {
      try {
        await deleteEmployee(id);
        toast.success('Radnik obrisan');
      } catch (error: any) {
        toast.error(error.message || 'Greška');
      }
    }
  };

  const handleLocationToggle = async (employeeId: string, locationId: string, isAssigned: boolean) => {
    try {
      if (isAssigned) {
        await removeEmployeeFromLocation(employeeId, locationId);
        toast.success('Lokacija uklonjena');
      } else {
        await assignEmployeeToLocation(employeeId, locationId);
        toast.success('Lokacija dodana');
      }
    } catch (error: any) {
      toast.error(error.message || 'Greška');
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      job_title: '',
      daily_work_hours: '8',
      weekly_work_hours: '40',
      monthly_work_hours: '160',
    });
    setEditingEmployee(null);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-8">
          <div className="flex items-center justify-center h-64">Učitavanje...</div>
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
              <h1 className="text-3xl font-bold">Radnici</h1>
              <p className="text-muted-foreground mt-1">
                Upravljanje radnicima i njihovim radnim satima
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Dodaj radnika
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingEmployee ? 'Uredi radnika' : 'Novi radnik'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      required
                    />
                  </div>
                  {!editingEmployee && (
                    <div>
                      <label className="text-sm font-medium">Lozinka</label>
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleFormChange('password', e.target.value)}
                        required
                      />
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium">Ime</label>
                    <Input
                      value={formData.first_name}
                      onChange={(e) => handleFormChange('first_name', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Prezime</label>
                    <Input
                      value={formData.last_name}
                      onChange={(e) => handleFormChange('last_name', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Naziv uloge (npr. Medicinska sestra)</label>
                    <Input
                      value={formData.job_title}
                      onChange={(e) => handleFormChange('job_title', e.target.value)}
                      placeholder="Medicinska sestra, Recepcionar..."
                      required
                    />
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold mb-3">Radni normativ</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-medium">Dnevno (h)</label>
                        <Input
                          type="number"
                          step="0.5"
                          value={formData.daily_work_hours}
                          onChange={(e) => handleFormChange('daily_work_hours', e.target.value)}
                          placeholder="8"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">Sedmično (h)</label>
                        <Input
                          type="number"
                          step="0.5"
                          value={formData.weekly_work_hours}
                          onChange={(e) => handleFormChange('weekly_work_hours', e.target.value)}
                          placeholder="40"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">Mjesečno (h)</label>
                        <Input
                          type="number"
                          step="0.5"
                          value={formData.monthly_work_hours}
                          onChange={(e) => handleFormChange('monthly_work_hours', e.target.value)}
                          placeholder="160"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Otkaži
                    </Button>
                    <Button type="submit">
                      {editingEmployee ? 'Sačuvaj' : 'Kreiraj'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Employees Table */}
        <div className="section-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Radnik</th>
                <th>Email</th>
                <th>Uloga</th>
                <th>Lokacije</th>
                <th className="w-32 text-center">Radni sati</th>
                <th className="w-24"></th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <React.Fragment key={employee.id}>
                  <tr>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {employee.first_name} {employee.last_name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="text-muted-foreground">{employee.email}</td>
                    <td>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {employee.job_title}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        {locations.map((location) => {
                          const isAssigned = employee.location_ids?.includes(location.id) || false;
                          return (
                            <label
                              key={location.id}
                              className="flex items-center gap-1.5 text-sm cursor-pointer hover:bg-muted px-2 py-1 rounded"
                            >
                              <Checkbox
                                checked={isAssigned}
                                onCheckedChange={() => handleLocationToggle(employee.id, location.id, isAssigned)}
                              />
                              {location.name}
                            </label>
                          );
                        })}
                      </div>
                    </td>
                    <td className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedEmployeeId(expandedEmployeeId === employee.id ? null : employee.id)}
                      >
                        {expandedEmployeeId === employee.id ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-1" />
                            Sakrij
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-1" />
                            Prikaži
                          </>
                        )}
                      </Button>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(employee)}
                          className="text-muted-foreground hover:text-primary"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(employee.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {expandedEmployeeId === employee.id && (
                    <tr>
                      <td colSpan={6} className="bg-muted/30">
                        <div className="p-6">
                          <WorkHoursStats
                            employeeId={employee.id}
                            employeeName={`${employee.first_name} ${employee.last_name}`}
                          />
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {employees.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nema radnika</h3>
              <p className="text-muted-foreground">Dodajte prvog radnika da biste započeli</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
            <h4 className="font-medium text-primary mb-1">Ukupno radnika</h4>
            <p className="text-2xl font-bold">{employees.length}</p>
            <p className="text-sm text-muted-foreground">Aktivnih: {employees.filter(e => e.active).length}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted border">
            <h4 className="font-medium mb-1">Različite uloge</h4>
            <p className="text-2xl font-bold">{new Set(employees.map(e => e.job_title)).size}</p>
            <p className="text-sm text-muted-foreground">Tipova poslova</p>
          </div>
          <div className="p-4 rounded-lg bg-success/5 border border-success/10">
            <h4 className="font-medium text-success mb-1">Lokacije</h4>
            <p className="text-2xl font-bold">{locations.filter(l => l.active).length}</p>
            <p className="text-sm text-muted-foreground">Aktivnih lokacija</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
