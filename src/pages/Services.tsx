import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, Receipt, Search } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useServices, Service } from '@/hooks/useServices';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function Services() {
  const { services, isLoading, addService, updateService, deleteService } = useServices();
  const { isAdmin } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [newService, setNewService] = useState<Omit<Service, 'id' | 'created_at'>>({
    name: '',
    price: 0,
    category: 'fiscal',
    active: true,
  });
  const [editService, setEditService] = useState<Partial<Service>>({});

  const handleAdd = async () => {
    if (!newService.name) {
      toast.error('Unesite naziv usluge');
      return;
    }
    try {
      await addService(newService);
      setNewService({
        name: '',
        price: 0,
        category: 'fiscal',
        active: true,
      });
      setIsAdding(false);
      toast.success('Usluga je uspješno dodana');
    } catch (error: any) {
      toast.error(error.message || 'Greška pri dodavanju usluge');
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await updateService(id, editService);
      setEditingId(null);
      setEditService({});
      toast.success('Usluga je ažurirana');
    } catch (error: any) {
      toast.error(error.message || 'Greška pri ažuriranju');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteService(id);
      toast.success('Usluga je uklonjena');
    } catch (error: any) {
      toast.error(error.message || 'Greška pri brisanju');
    }
  };

  const startEditing = (service: Service) => {
    setEditingId(service.id);
    setEditService(service);
  };

  const filteredServices = services.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || s.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const fiscalServices = filteredServices.filter(s => s.category === 'fiscal');
  const nonFiscalServices = filteredServices.filter(s => s.category === 'non-fiscal');

  if (!isAdmin) {
    return (
      <MainLayout>
        <div className="p-4 lg:p-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Samo administratori mogu upravljati uslugama.
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-4 lg:p-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 lg:mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Usluge - Cjenovnik</h1>
              <p className="text-muted-foreground mt-1 text-sm lg:text-base">
                Upravljanje uslugama i cijenama
              </p>
            </div>
            <Button onClick={() => setIsAdding(true)} disabled={isAdding} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Dodaj uslugu
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pretraži usluge..."
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Sve kategorije</SelectItem>
                <SelectItem value="fiscal">Fiskalne</SelectItem>
                <SelectItem value="non-fiscal">Nefiskalne</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Add new service form */}
        {isAdding && (
          <div className="section-card p-4 lg:p-6 mb-6 border-2 border-dashed border-primary/30">
            <h3 className="font-medium mb-4">Nova usluga</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <label className="text-sm font-medium mb-1 block">Naziv *</label>
                <Input
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  placeholder="Naziv usluge"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Cijena (KM)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={newService.price}
                  onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Kategorija</label>
                <Select
                  value={newService.category}
                  onValueChange={(value: 'fiscal' | 'non-fiscal') => 
                    setNewService({ ...newService, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fiscal">Fiskalna</SelectItem>
                    <SelectItem value="non-fiscal">Nefiskalna</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Switch
                  checked={newService.active}
                  onCheckedChange={(checked) => setNewService({ ...newService, active: checked })}
                />
                <span className="text-sm">Aktivna</span>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="ghost" onClick={() => setIsAdding(false)} className="flex-1 sm:flex-none">
                  Otkaži
                </Button>
                <Button onClick={handleAdd} className="flex-1 sm:flex-none">
                  Sačuvaj
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Services - Mobile Cards */}
        <div className="lg:hidden space-y-3">
          {filteredServices.map((service) => (
            <div key={service.id} className={`section-card p-4 ${!service.active ? 'opacity-60' : ''}`}>
              {editingId === service.id ? (
                <div className="space-y-3">
                  <Input
                    value={editService.name || ''}
                    onChange={(e) => setEditService({ ...editService, name: e.target.value })}
                    placeholder="Naziv"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="number"
                      step="0.01"
                      value={editService.price || 0}
                      onChange={(e) => setEditService({ ...editService, price: parseFloat(e.target.value) || 0 })}
                      placeholder="Cijena"
                    />
                    <Select
                      value={editService.category}
                      onValueChange={(value: 'fiscal' | 'non-fiscal') => 
                        setEditService({ ...editService, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fiscal">Fiskalna</SelectItem>
                        <SelectItem value="non-fiscal">Nefiskalna</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={editService.active}
                        onCheckedChange={(checked) => setEditService({ ...editService, active: checked })}
                      />
                      <span className="text-sm">Aktivna</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                      <Button size="sm" onClick={() => handleUpdate(service.id)}>
                        <Check className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{service.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-lg font-semibold">{Number(service.price).toFixed(2)} KM</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        service.category === 'fiscal' 
                          ? 'bg-fiscal-light text-fiscal'
                          : 'bg-non-fiscal-light text-non-fiscal'
                      }`}>
                        {service.category === 'fiscal' ? 'Fiskalna' : 'Nefiskalna'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => startEditing(service)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(service.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Services Table - Desktop */}
        <div className="hidden lg:block section-card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Naziv usluge</th>
                <th className="w-32 text-right">Cijena (KM)</th>
                <th className="w-32">Kategorija</th>
                <th className="w-24 text-center">Aktivna</th>
                <th className="w-24"></th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((service) => (
                <tr key={service.id} className={!service.active ? 'opacity-60' : ''}>
                  {editingId === service.id ? (
                    <>
                      <td>
                        <Input
                          value={editService.name || ''}
                          onChange={(e) => setEditService({ ...editService, name: e.target.value })}
                        />
                      </td>
                      <td>
                        <Input
                          type="number"
                          step="0.01"
                          value={editService.price || 0}
                          onChange={(e) => setEditService({ ...editService, price: parseFloat(e.target.value) || 0 })}
                          className="text-right"
                        />
                      </td>
                      <td>
                        <Select
                          value={editService.category}
                          onValueChange={(value: 'fiscal' | 'non-fiscal') => 
                            setEditService({ ...editService, category: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fiscal">Fiskalna</SelectItem>
                            <SelectItem value="non-fiscal">Nefiskalna</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="text-center">
                        <Switch
                          checked={editService.active}
                          onCheckedChange={(checked) => setEditService({ ...editService, active: checked })}
                        />
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleUpdate(service.id)}>
                            <Check className="w-4 h-4 text-success" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setEditingId(null)}>
                            <X className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="font-medium">{service.name}</td>
                      <td className="text-right font-mono">{Number(service.price).toFixed(2)}</td>
                      <td>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          service.category === 'fiscal' 
                            ? 'bg-fiscal-light text-fiscal'
                            : 'bg-non-fiscal-light text-non-fiscal'
                        }`}>
                          {service.category === 'fiscal' ? 'Fiskalna' : 'Nefiskalna'}
                        </span>
                      </td>
                      <td className="text-center">
                        <Switch
                          checked={service.active}
                          onCheckedChange={(checked) => updateService(service.id, { active: checked })}
                        />
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => startEditing(service)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(service.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {filteredServices.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nema usluga</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Nema rezultata za vašu pretragu' : 'Dodajte prvu uslugu da biste započeli'}
              </p>
            </div>
          )}
        </div>

        {/* Empty state for mobile */}
        {filteredServices.length === 0 && !isLoading && (
          <div className="lg:hidden text-center py-12 section-card">
            <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nema usluga</h3>
            <p className="text-muted-foreground text-sm">
              {searchQuery ? 'Nema rezultata za vašu pretragu' : 'Dodajte prvu uslugu'}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mt-6 lg:mt-8">
          <div className="p-4 rounded-lg bg-fiscal-light border border-fiscal/10">
            <h4 className="font-medium text-fiscal mb-1 text-sm lg:text-base">Fiskalne usluge</h4>
            <p className="text-xl lg:text-2xl font-bold">{fiscalServices.length}</p>
          </div>
          <div className="p-4 rounded-lg bg-non-fiscal-light border border-non-fiscal/10">
            <h4 className="font-medium text-non-fiscal mb-1 text-sm lg:text-base">Nefiskalne usluge</h4>
            <p className="text-xl lg:text-2xl font-bold">{nonFiscalServices.length}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted border">
            <h4 className="font-medium mb-1 text-sm lg:text-base">Ukupno usluga</h4>
            <p className="text-xl lg:text-2xl font-bold">{services.length}</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
