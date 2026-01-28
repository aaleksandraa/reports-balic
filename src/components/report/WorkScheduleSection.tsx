import { Plus, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useReport } from '@/contexts/ReportContext';
import { useEmployees } from '@/hooks/useEmployees';

export function WorkScheduleSection() {
  const { currentReport, addWorkScheduleItem, updateWorkScheduleItem, deleteWorkScheduleItem } = useReport();
  const { employees } = useEmployees();
  const report = currentReport;

  const activeEmployees = employees.filter(emp => emp.active);

  const handleAddItem = () => {
    addWorkScheduleItem({
      employeeName: '',
      arrivalTime: '',
      departureTime: '',
      hoursWorked: 0,
    });
  };

  const handleEmployeeSelect = (itemId: string, employeeId: string) => {
    const employee = activeEmployees.find(emp => emp.id === employeeId);
    if (employee) {
      updateWorkScheduleItem(itemId, {
        employeeName: `${employee.first_name} ${employee.last_name}`,
        employeeId: employeeId,
      });
    }
  };

  const calculateHours = (arrival: string, departure: string): number => {
    if (!arrival || !departure) return 0;
    const [arrHour, arrMin] = arrival.split(':').map(Number);
    const [depHour, depMin] = departure.split(':').map(Number);
    const arrTotal = arrHour * 60 + arrMin;
    const depTotal = depHour * 60 + depMin;
    return Math.max(0, (depTotal - arrTotal) / 60);
  };

  const handleTimeChange = (id: string, field: 'arrivalTime' | 'departureTime', value: string) => {
    const item = report.workSchedule.find(w => w.id === id);
    if (item) {
      const newArrival = field === 'arrivalTime' ? value : item.arrivalTime;
      const newDeparture = field === 'departureTime' ? value : item.departureTime;
      updateWorkScheduleItem(id, {
        [field]: value,
        hoursWorked: calculateHours(newArrival, newDeparture),
      });
    }
  };

  const totalHours = report.workSchedule.reduce((sum, item) => sum + item.hoursWorked, 0);

  return (
    <div className="section-card animate-slide-up">
      <div className="section-header">
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
          <Clock className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Radni raspored</h3>
          <p className="text-sm text-muted-foreground">Evidencija radnog vremena</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-8">#</th>
              <th className="min-w-[200px]">Ime i prezime</th>
              <th className="w-32">Dolazak</th>
              <th className="w-32">Odlazak</th>
              <th className="w-24 text-center">Br. sati</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {report.workSchedule.map((item, index) => (
              <tr key={item.id}>
                <td className="text-muted-foreground">{index + 1}</td>
                <td>
                  <Select
                    value={(item as any).employeeId || ''}
                    onValueChange={(value) => handleEmployeeSelect(item.id, value)}
                  >
                    <SelectTrigger className="border-0 bg-transparent focus:ring-1">
                      <SelectValue placeholder="Izaberite radnika...">
                        {item.employeeName || 'Izaberite radnika...'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {activeEmployees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name} - {emp.job_title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td>
                  <Input
                    type="time"
                    value={item.arrivalTime}
                    onChange={(e) => handleTimeChange(item.id, 'arrivalTime', e.target.value)}
                    className="border-0 bg-transparent focus-visible:ring-1"
                  />
                </td>
                <td>
                  <Input
                    type="time"
                    value={item.departureTime}
                    onChange={(e) => handleTimeChange(item.id, 'departureTime', e.target.value)}
                    className="border-0 bg-transparent focus-visible:ring-1"
                  />
                </td>
                <td className="text-center font-medium">
                  {item.hoursWorked.toFixed(1)}
                </td>
                <td>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteWorkScheduleItem(item.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
            <tr className="summary-row">
              <td></td>
              <td className="font-semibold">UKUPNO</td>
              <td></td>
              <td></td>
              <td className="text-center font-semibold">{totalHours.toFixed(1)}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleAddItem}
        className="mt-4"
      >
        <Plus className="w-4 h-4 mr-2" />
        Dodaj osobu
      </Button>
    </div>
  );
}
