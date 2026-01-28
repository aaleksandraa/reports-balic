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
  const { currentReport, updateCurrentReport } = useReportContext();
  const { services } = useServices();

  const quickEntries: QuickEntry[] = currentReport.today_patients_quick || [];
  const detailedEntries: DetailedEntry[] = currentReport.today_patients_detailed || [];

  // Quick Entry Functions
  const addQuickEntry = () => {
    const newEntry: QuickEntry = {
      service_id: '',
      service_name: '',
      count: 1,
    };
    updateCurrentReport({
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
    
    updateCurrentReport({ today_patients_quick: updated });
  };

  const removeQuickEntry = (index: number) => {
    const updated = quickEntries.filter((_, i) => i !== index);
    updateCurrentReport({ today_patients_quick: updated });
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
    updateCurrentReport({
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
    
    updateCurrentReport({ today_patients_detailed: updated });
  };

  const removeDetailedEntry = (index: number) => {
    const updated = detailedEntries.filter((_, i) => i !== index);
    updateCurrentReport({ today_patients_detailed: updated });
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
      <CardContent className="space-y-6">
        {/* Quick Entry Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Grid3x3 className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Brzi Unos</h3>
              <span className="text-xs text-muted-foreground">(ukupan broj po usluzi)</span>
            </div>
            <Button onClick={addQuickEntry} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Dodaj
            </Button>
          </div>

          {quickEntries.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-3 bg-muted/30 rounded-lg">
              Nema brzih unosa
            </p>
          ) : (
            <div className="space-y-2">
              {quickEntries.map((entry, index) => (
                <Card key={index} className="p-3 bg-muted/30">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                    <div className="md:col-span-3">
                      <Label htmlFor={`quick-service-${index}`} className="text-xs">Usluga</Label>
                      <Select
                        value={entry.service_id}
                        onValueChange={(value) => updateQuickEntry(index, 'service_id', value)}
                      >
                        <SelectTrigger id={`quick-service-${index}`} className="h-9">
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

                    <div>
                      <Label htmlFor={`quick-count-${index}`} className="text-xs">Broj</Label>
                      <Input
                        id={`quick-count-${index}`}
                        type="number"
                        min="1"
                        value={entry.count}
                        onChange={(e) =>
                          updateQuickEntry(index, 'count', parseInt(e.target.value) || 1)
                        }
                        className="h-9"
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeQuickEntry(index)}
                        className="w-full h-9"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">ili</span>
          </div>
        </div>

        {/* Detailed Entry Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <List className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Detaljni Unos</h3>
              <span className="text-xs text-muted-foreground">(ime, prezime, usluga)</span>
            </div>
            <Button onClick={addDetailedEntry} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Dodaj
            </Button>
          </div>

          {detailedEntries.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-3 bg-muted/30 rounded-lg">
              Nema detaljnih unosa
            </p>
          ) : (
            <div className="space-y-2">
              {detailedEntries.map((entry, index) => (
                <Card key={index} className="p-3 bg-muted/30">
                  <div className="space-y-2">
                    {/* First Row: Name, Surname, Service, Delete */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                      <div>
                        <Label htmlFor={`detailed-first-${index}`} className="text-xs">Ime</Label>
                        <Input
                          id={`detailed-first-${index}`}
                          value={entry.patient_first_name}
                          onChange={(e) =>
                            updateDetailedEntry(index, 'patient_first_name', e.target.value)
                          }
                          placeholder="Ime"
                          className="h-9"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`detailed-last-${index}`} className="text-xs">Prezime</Label>
                        <Input
                          id={`detailed-last-${index}`}
                          value={entry.patient_last_name}
                          onChange={(e) =>
                            updateDetailedEntry(index, 'patient_last_name', e.target.value)
                          }
                          placeholder="Prezime"
                          className="h-9"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor={`detailed-service-${index}`} className="text-xs">Usluga</Label>
                        <Select
                          value={entry.service_id}
                          onValueChange={(value) =>
                            updateDetailedEntry(index, 'service_id', value)
                          }
                        >
                          <SelectTrigger id={`detailed-service-${index}`} className="h-9">
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

                      <div className="flex items-end">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeDetailedEntry(index)}
                          className="w-full h-9"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Second Row: Notes */}
                    <div>
                      <Label htmlFor={`detailed-notes-${index}`} className="text-xs">Napomena</Label>
                      <Textarea
                        id={`detailed-notes-${index}`}
                        value={entry.notes}
                        onChange={(e) =>
                          updateDetailedEntry(index, 'notes', e.target.value)
                        }
                        placeholder="Dodatne napomene..."
                        rows={2}
                        className="resize-none"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        {Object.keys(serviceSummary).length > 0 && (
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>📊 Pregled po Uslugama Danas</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {Object.keys(serviceSummary).length} {Object.keys(serviceSummary).length === 1 ? 'usluga' : 'usluge'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(serviceSummary)
                  .sort(([, a], [, b]) => b - a)
                  .map(([serviceName, count]) => (
                    <div 
                      key={serviceName} 
                      className="flex justify-between items-center p-2 bg-background rounded-lg border"
                    >
                      <span className="font-medium text-sm">{serviceName}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all"
                            style={{ 
                              width: `${Math.min((count / getTotalPatients()) * 100, 100)}%` 
                            }}
                          />
                        </div>
                        <span className="font-bold text-primary min-w-[2.5rem] text-right">
                          {count}x
                        </span>
                      </div>
                    </div>
                  ))}
                <div className="pt-2 border-t-2 border-primary/30 flex justify-between items-center">
                  <span className="font-bold">UKUPNO PACIJENATA</span>
                  <span className="text-xl font-bold text-primary">{getTotalPatients()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
