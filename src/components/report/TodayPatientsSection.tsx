import { useState } from 'react';
import { Plus, Trash2, Users, List, Grid3x3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useReportContext } from '@/contexts/ReportContext';
import { useServices } from '@/hooks/useServices';

interface QuickEntry {
  id?: string;
  service_id: string;
  service_name: string;
  count: number;
}

interface DetailedEntry {
  id?: string;
  patient_first_name: string;
  patient_last_name: string;
  service_id: string;
  service_name: string;
  notes: string;
}

export function TodayPatientsSection() {
  const { reportData, updateReportData } = useReportContext();
  const { services } = useServices();
  const [activeTab, setActiveTab] = useState<'quick' | 'detailed'>('quick');

  const quickEntries: QuickEntry[] = reportData.today_patients_quick || [];
  const detailedEntries: DetailedEntry[] = reportData.today_patients_detailed || [];

  // Quick Entry Functions
  const addQuickEntry = () => {
    const newEntry: QuickEntry = {
      service_id: '',
      service_name: '',
      count: 1,
    };
    updateReportData({
      today_patients_quick: [...quickEntries, newEntry],
    });
  };

  const updateQuickEntry = (index: number, field: keyof QuickEntry, value: any) => {
    const updated = [...quickEntries];
    
    if (field === 'service_id') {
      const service = services.find(s => s.id === value);
      updated[index] = {
        ...updated[index],
        service_id: value,
        service_name: service?.name || '',
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    
    updateReportData({ today_patients_quick: updated });
  };

  const removeQuickEntry = (index: number) => {
    const updated = quickEntries.filter((_, i) => i !== index);
    updateReportData({ today_patients_quick: updated });
  };

  // Detailed Entry Functions
  const addDetailedEntry = () => {
    const newEntry: DetailedEntry = {
      patient_first_name: '',
      patient_last_name: '',
      service_id: '',
      service_name: '',
      notes: '',
    };
    updateReportData({
      today_patients_detailed: [...detailedEntries, newEntry],
    });
  };

  const updateDetailedEntry = (index: number, field: keyof DetailedEntry, value: any) => {
    const updated = [...detailedEntries];
    
    if (field === 'service_id') {
      const service = services.find(s => s.id === value);
      updated[index] = {
        ...updated[index],
        service_id: value,
        service_name: service?.name || '',
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    
    updateReportData({ today_patients_detailed: updated });
  };

  const removeDetailedEntry = (index: number) => {
    const updated = detailedEntries.filter((_, i) => i !== index);
    updateReportData({ today_patients_detailed: updated });
  };

  // Calculate totals
  const getTotalPatients = () => {
    const quickTotal = quickEntries.reduce((sum, entry) => sum + (entry.count || 0), 0);
    const detailedTotal = detailedEntries.length;
    return quickTotal + detailedTotal;
  };

  const getServiceSummary = () => {
    const summary: { [key: string]: number } = {};
    
    // Add quick entries
    quickEntries.forEach(entry => {
      if (entry.service_name) {
        summary[entry.service_name] = (summary[entry.service_name] || 0) + entry.count;
      }
    });
    
    // Add detailed entries
    detailedEntries.forEach(entry => {
      if (entry.service_name) {
        summary[entry.service_name] = (summary[entry.service_name] || 0) + 1;
      }
    });
    
    return summary;
  };

  const serviceSummary = getServiceSummary();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span>Današnji Pacijenti</span>
          </div>
          <div className="text-sm font-normal text-muted-foreground">
            Ukupno: <span className="font-bold text-lg text-primary">{getTotalPatients()}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'quick' | 'detailed')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="quick" className="flex items-center gap-2">
              <Grid3x3 className="h-4 w-4" />
              Brzi Unos
            </TabsTrigger>
            <TabsTrigger value="detailed" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Detaljni Unos
            </TabsTrigger>
          </TabsList>

          {/* Quick Entry Tab */}
          <TabsContent value="quick" className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Brzo unesite ukupan broj pacijenata po usluzi (npr. 2x PRP, 3x Mezoterapija)
            </div>

            {quickEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nema unesenih podataka. Kliknite "Dodaj" da dodate brzi unos.
              </p>
            ) : (
              <div className="space-y-3">
                {quickEntries.map((entry, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor={`quick-service-${index}`}>Usluga</Label>
                        <Select
                          value={entry.service_id}
                          onValueChange={(value) => updateQuickEntry(index, 'service_id', value)}
                        >
                          <SelectTrigger id={`quick-service-${index}`}>
                            <SelectValue placeholder="Izaberite uslugu" />
                          </SelectTrigger>
                          <SelectContent>
                            {services.map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                {service.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Label htmlFor={`quick-count-${index}`}>Broj</Label>
                          <Input
                            id={`quick-count-${index}`}
                            type="number"
                            min="1"
                            value={entry.count}
                            onChange={(e) =>
                              updateQuickEntry(index, 'count', parseInt(e.target.value) || 1)
                            }
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => removeQuickEntry(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <Button onClick={addQuickEntry} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Dodaj Brzi Unos
            </Button>
          </TabsContent>

          {/* Detailed Entry Tab */}
          <TabsContent value="detailed" className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Unesite detaljne podatke za svakog pacijenta (ime, prezime, usluga, napomena)
            </div>

            {detailedEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nema unesenih podataka. Kliknite "Dodaj" da dodate detaljni unos.
              </p>
            ) : (
              <div className="space-y-3">
                {detailedEntries.map((entry, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`detailed-first-${index}`}>Ime</Label>
                        <Input
                          id={`detailed-first-${index}`}
                          value={entry.patient_first_name}
                          onChange={(e) =>
                            updateDetailedEntry(index, 'patient_first_name', e.target.value)
                          }
                          placeholder="Unesite ime"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`detailed-last-${index}`}>Prezime</Label>
                        <Input
                          id={`detailed-last-${index}`}
                          value={entry.patient_last_name}
                          onChange={(e) =>
                            updateDetailedEntry(index, 'patient_last_name', e.target.value)
                          }
                          placeholder="Unesite prezime"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor={`detailed-service-${index}`}>Usluga</Label>
                        <Select
                          value={entry.service_id}
                          onValueChange={(value) =>
                            updateDetailedEntry(index, 'service_id', value)
                          }
                        >
                          <SelectTrigger id={`detailed-service-${index}`}>
                            <SelectValue placeholder="Izaberite uslugu" />
                          </SelectTrigger>
                          <SelectContent>
                            {services.map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                {service.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor={`detailed-notes-${index}`}>Napomena</Label>
                        <Textarea
                          id={`detailed-notes-${index}`}
                          value={entry.notes}
                          onChange={(e) =>
                            updateDetailedEntry(index, 'notes', e.target.value)
                          }
                          placeholder="Dodatne napomene..."
                          rows={2}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeDetailedEntry(index)}
                          className="w-full"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Ukloni
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <Button onClick={addDetailedEntry} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Dodaj Detaljni Unos
            </Button>
          </TabsContent>
        </Tabs>

        {/* Summary */}
        {Object.keys(serviceSummary).length > 0 && (
          <Card className="mt-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>📊 Pregled po Uslugama Danas</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {Object.keys(serviceSummary).length} {Object.keys(serviceSummary).length === 1 ? 'usluga' : 'usluge'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(serviceSummary)
                  .sort(([, a], [, b]) => b - a) // Sort by count descending
                  .map(([serviceName, count]) => (
                    <div 
                      key={serviceName} 
                      className="flex justify-between items-center p-3 bg-background rounded-lg border"
                    >
                      <span className="font-medium">{serviceName}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all"
                            style={{ 
                              width: `${Math.min((count / getTotalPatients()) * 100, 100)}%` 
                            }}
                          />
                        </div>
                        <span className="font-bold text-lg text-primary min-w-[3rem] text-right">
                          {count}x
                        </span>
                      </div>
                    </div>
                  ))}
                <div className="pt-3 border-t-2 border-primary/30 flex justify-between items-center">
                  <span className="font-bold text-lg">UKUPNO PACIJENATA</span>
                  <span className="text-2xl font-bold text-primary">{getTotalPatients()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
