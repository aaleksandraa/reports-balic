import { Plus, Trash2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useReport } from '@/contexts/ReportContext';
import { VISIT_REASONS, CITIES } from '@/types/report';

export function PatientsSection() {
  const { doctors, currentReport, addPatient, updatePatient, deletePatient } = useReport();
  const report = currentReport;
  const activeDoctors = doctors.filter(d => d.role === 'doctor' && d.active);

  const handleAddPatient = () => {
    addPatient({
      fullName: '',
      city: '',
      reason: '',
      doctorId: activeDoctors[0]?.id || '',
    });
  };

  return (
    <div className="section-card animate-slide-up">
      <div className="section-header">
        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
          <UserPlus className="w-5 h-5 text-accent-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Novi pacijenti</h3>
          <p className="text-sm text-muted-foreground">Pacijentice koje su prvi put došle u Centar</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-8">#</th>
              <th className="min-w-[200px]">Ime i prezime</th>
              <th className="w-40">Grad</th>
              <th className="w-48">Razlog dolaska</th>
              <th className="w-32">Doktor</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {report.patients.map((patient, index) => (
              <tr key={patient.id}>
                <td className="text-muted-foreground">{index + 1}</td>
                <td>
                  <Input
                    value={patient.fullName}
                    onChange={(e) => updatePatient(patient.id, { fullName: e.target.value })}
                    placeholder="Ime i prezime..."
                    className="border-0 bg-transparent focus-visible:ring-1"
                  />
                </td>
                <td>
                  <Select
                    value={patient.city}
                    onValueChange={(value) => updatePatient(patient.id, { city: value })}
                  >
                    <SelectTrigger className="border-0 bg-transparent focus:ring-1">
                      <SelectValue placeholder="Grad" />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td>
                  <Select
                    value={patient.reason}
                    onValueChange={(value) => updatePatient(patient.id, { reason: value })}
                  >
                    <SelectTrigger className="border-0 bg-transparent focus:ring-1">
                      <SelectValue placeholder="Razlog" />
                    </SelectTrigger>
                    <SelectContent>
                      {VISIT_REASONS.map(reason => (
                        <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td>
                  <Select
                    value={patient.doctorId}
                    onValueChange={(value) => updatePatient(patient.id, { doctorId: value })}
                  >
                    <SelectTrigger className="border-0 bg-transparent focus:ring-1">
                      <SelectValue placeholder="Doktor" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeDoctors.map(doc => (
                        <SelectItem key={doc.id} value={doc.id}>
                          {doc.firstName} {doc.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deletePatient(patient.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleAddPatient}
        className="mt-4"
      >
        <Plus className="w-4 h-4 mr-2" />
        Dodaj pacijenticu
      </Button>
    </div>
  );
}
