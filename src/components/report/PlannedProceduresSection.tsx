import { Plus, Trash2, Calendar, ClipboardList } from 'lucide-react';
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

interface PlannedProcedure {
  id?: string;
  patient_first_name: string;
  patient_last_name: string;
  procedure_type: string;
  procedure_details: string;
  planned_date: string;
  planned_month: string;
  notes: string;
}

const PROCEDURE_TYPES = [
  'HSC operacija',
  'Vantjelesna oplodnja',
  'Inseminacija',
  'Pregled za inseminaciju',
  'Kandidat za operaciju',
  'Ostalo',
];

const MONTHS = [
  'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni',
  'Juli', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
];

export function PlannedProceduresSection() {
  const { reportData, updateReportData } = useReportContext();

  const plannedProcedures: PlannedProcedure[] = reportData.planned_procedures || [];

  const addProcedure = () => {
    const newProcedure: PlannedProcedure = {
      patient_first_name: '',
      patient_last_name: '',
      procedure_type: '',
      procedure_details: '',
      planned_date: '',
      planned_month: '',
      notes: '',
    };

    updateReportData({
      planned_procedures: [...plannedProcedures, newProcedure],
    });
  };

  const updateProcedure = (index: number, field: keyof PlannedProcedure, value: string) => {
    const updated = [...plannedProcedures];
    updated[index] = { ...updated[index], [field]: value };
    
    // If date is set, clear month and vice versa
    if (field === 'planned_date' && value) {
      updated[index].planned_month = '';
    } else if (field === 'planned_month' && value) {
      updated[index].planned_date = '';
    }
    
    updateReportData({ planned_procedures: updated });
  };

  const removeProcedure = (index: number) => {
    const updated = plannedProcedures.filter((_, i) => i !== index);
    updateReportData({ planned_procedures: updated });
  };

  const getCurrentYear = () => new Date().getFullYear();

  return (
    <Card className="border-2 border-green-200 bg-green-50/50">
      <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            <span>📋 PLAN - Planirane Procedure</span>
          </div>
          <Button 
            onClick={addProcedure} 
            size="sm"
            variant="secondary"
            className="bg-white text-green-700 hover:bg-green-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Dodaj
          </Button>
        </CardTitle>
        <p className="text-sm text-green-50 mt-2">
          Evidencija kandidata za operacije, inseminacije i druge planirane procedure
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {plannedProcedures.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nema planiranih procedura.</p>
            <p className="text-sm">Kliknite "Dodaj" da dodate novu planiranu proceduru.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {plannedProcedures.map((procedure, index) => (
              <Card key={index} className="p-4 border-green-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`first-name-${index}`}>Ime Pacijenta *</Label>
                    <Input
                      id={`first-name-${index}`}
                      value={procedure.patient_first_name}
                      onChange={(e) =>
                        updateProcedure(index, 'patient_first_name', e.target.value)
                      }
                      placeholder="Unesite ime"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`last-name-${index}`}>Prezime Pacijenta *</Label>
                    <Input
                      id={`last-name-${index}`}
                      value={procedure.patient_last_name}
                      onChange={(e) =>
                        updateProcedure(index, 'patient_last_name', e.target.value)
                      }
                      placeholder="Unesite prezime"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`procedure-type-${index}`}>Vrsta Procedure *</Label>
                    <Select
                      value={procedure.procedure_type}
                      onValueChange={(value) =>
                        updateProcedure(index, 'procedure_type', value)
                      }
                    >
                      <SelectTrigger id={`procedure-type-${index}`}>
                        <SelectValue placeholder="Izaberite vrstu" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROCEDURE_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor={`procedure-details-${index}`}>Detalji Procedure</Label>
                    <Input
                      id={`procedure-details-${index}`}
                      value={procedure.procedure_details}
                      onChange={(e) =>
                        updateProcedure(index, 'procedure_details', e.target.value)
                      }
                      placeholder="Npr. HSC, IVF, IUI..."
                    />
                  </div>

                  <div>
                    <Label htmlFor={`planned-date-${index}`}>
                      Tačan Datum <span className="text-xs text-muted-foreground">(ako je poznat)</span>
                    </Label>
                    <Input
                      id={`planned-date-${index}`}
                      type="date"
                      value={procedure.planned_date}
                      onChange={(e) =>
                        updateProcedure(index, 'planned_date', e.target.value)
                      }
                      disabled={!!procedure.planned_month}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`planned-month-${index}`}>
                      Ili Mjesec <span className="text-xs text-muted-foreground">(ako datum nije poznat)</span>
                    </Label>
                    <div className="flex gap-2">
                      <Select
                        value={procedure.planned_month}
                        onValueChange={(value) =>
                          updateProcedure(index, 'planned_month', value)
                        }
                        disabled={!!procedure.planned_date}
                      >
                        <SelectTrigger id={`planned-month-${index}`}>
                          <SelectValue placeholder="Mjesec" />
                        </SelectTrigger>
                        <SelectContent>
                          {MONTHS.map((month) => (
                            <SelectItem key={month} value={`${month} ${getCurrentYear()}`}>
                              {month} {getCurrentYear()}
                            </SelectItem>
                          ))}
                          {MONTHS.map((month) => (
                            <SelectItem key={`${month}-next`} value={`${month} ${getCurrentYear() + 1}`}>
                              {month} {getCurrentYear() + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor={`notes-${index}`}>Dodatne Napomene</Label>
                    <Textarea
                      id={`notes-${index}`}
                      value={procedure.notes}
                      onChange={(e) =>
                        updateProcedure(index, 'notes', e.target.value)
                      }
                      placeholder="Dodatne informacije, napomene..."
                      rows={2}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeProcedure(index)}
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

        {plannedProcedures.length > 0 && (
          <Card className="bg-green-100 border-green-300">
            <CardContent className="pt-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Ukupno Planiranih Procedura:</span>
                <span className="text-2xl font-bold text-green-700">
                  {plannedProcedures.length}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
