import { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useEmployees, WorkHoursStats as WorkHoursStatsType } from '@/hooks/useEmployees';
import { format } from 'date-fns';
import { bs } from 'date-fns/locale';
import { toast } from 'sonner';

interface WorkHoursStatsProps {
  employeeId: string;
  employeeName: string;
}

export function WorkHoursStats({ employeeId, employeeName }: WorkHoursStatsProps) {
  const { getWorkHoursStats } = useEmployees();
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [stats, setStats] = useState<WorkHoursStatsType | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const data = await getWorkHoursStats(employeeId, period, dateStr);
      setStats(data);
    } catch (error: any) {
      toast.error(error.message || 'Greška pri učitavanju statistike');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [employeeId, period, selectedDate]);

  if (loading) {
    return <div className="text-center py-4">Učitavanje...</div>;
  }

  if (!stats) {
    return null;
  }

  const formatEuropeanDate = (dateStr: string) => {
    return format(new Date(dateStr), 'dd.MM.yyyy', { locale: bs });
  };

  const getDayName = (dateStr: string) => {
    return format(new Date(dateStr), 'EEEE', { locale: bs });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-end flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium mb-2 block">Period</label>
          <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Dnevno</SelectItem>
              <SelectItem value="week">Sedmično</SelectItem>
              <SelectItem value="month">Mjesečno</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium mb-2 block">Datum</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <Calendar className="mr-2 h-4 w-4" />
                {format(selectedDate, 'dd.MM.yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <Button onClick={fetchStats}>Prikaži</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Odrađeno</p>
              <p className="text-2xl font-bold">{stats.total_hours.toFixed(1)}h</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Normativ</p>
              <p className="text-2xl font-bold">{stats.expected_hours.toFixed(1)}h</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              stats.difference >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <Clock className={`w-5 h-5 ${stats.difference >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Razlika</p>
              <p className={`text-2xl font-bold ${stats.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.difference >= 0 ? '+' : ''}{stats.difference.toFixed(1)}h
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Radnih dana</p>
              <p className="text-2xl font-bold">{stats.total_days}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Summary */}
      {(stats.vacation_days > 0 || stats.sick_leave_days > 0 || stats.absent_days > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.vacation_days > 0 && (
            <div className="card p-4 bg-blue-50">
              <p className="text-sm text-muted-foreground">Godišnji odmor</p>
              <p className="text-xl font-bold text-blue-600">{stats.vacation_days} dana</p>
            </div>
          )}
          {stats.sick_leave_days > 0 && (
            <div className="card p-4 bg-orange-50">
              <p className="text-sm text-muted-foreground">Bolovanje</p>
              <p className="text-xl font-bold text-orange-600">{stats.sick_leave_days} dana</p>
            </div>
          )}
          {stats.absent_days > 0 && (
            <div className="card p-4 bg-red-50">
              <p className="text-sm text-muted-foreground">Odsutan</p>
              <p className="text-xl font-bold text-red-600">{stats.absent_days} dana</p>
            </div>
          )}
        </div>
      )}

      {stats.daily_breakdown.length > 0 && (
        <div className="card">
          <div className="p-4 border-b">
            <h4 className="font-semibold">
              {period === 'week' ? 'Sedmični pregled' : period === 'month' ? 'Mjesečni pregled' : 'Dnevni pregled'}
            </h4>
            <p className="text-sm text-muted-foreground">
              {formatEuropeanDate(stats.start_date)} - {formatEuropeanDate(stats.end_date)}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse table-fixed">
              <colgroup>
                <col style={{ width: '15%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '15%' }} />
              </colgroup>
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold bg-gray-50">Datum</th>
                  <th className="text-left py-3 px-4 font-semibold bg-gray-50">Dan</th>
                  <th className="text-left py-3 px-4 font-semibold bg-gray-50">Status</th>
                  <th className="text-left py-3 px-4 font-semibold bg-gray-50">Odrađeno</th>
                  <th className="text-left py-3 px-4 font-semibold bg-gray-50">Normativ</th>
                  <th className="text-left py-3 px-4 font-semibold bg-gray-50">Razlika</th>
                </tr>
              </thead>
              <tbody>
                {stats.daily_breakdown.map((day) => {
                  const statusLabel = day.status === 'vacation' ? 'Godišnji' :
                                    day.status === 'sick_leave' ? 'Bolovanje' :
                                    day.status === 'absent' ? 'Odsutan' : 'Prisutan';
                  const statusColor = day.status === 'vacation' ? 'bg-blue-100 text-blue-700' :
                                    day.status === 'sick_leave' ? 'bg-orange-100 text-orange-700' :
                                    day.status === 'absent' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700';
                  
                  return (
                    <tr key={day.date} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{formatEuropeanDate(day.date)}</td>
                      <td className="py-3 px-4 text-muted-foreground">{getDayName(day.date)}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${statusColor}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold">{day.hours.toFixed(1)}h</td>
                      <td className="py-3 px-4 text-muted-foreground">{day.expected_hours.toFixed(1)}h</td>
                      <td className="py-3 px-4">
                        {day.status === 'present' ? (
                          <span className={`font-semibold ${
                            day.difference >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {day.difference >= 0 ? '+' : ''}{day.difference.toFixed(1)}h
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td colSpan={3} className="py-3 px-4 font-bold text-lg">UKUPNO</td>
                  <td className="py-3 px-4 font-bold text-lg">{stats.total_hours.toFixed(1)}h</td>
                  <td className="py-3 px-4 font-bold text-lg">{stats.expected_hours.toFixed(1)}h</td>
                  <td className="py-3 px-4">
                    <span className={`font-bold text-lg ${
                      stats.difference >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stats.difference >= 0 ? '+' : ''}{stats.difference.toFixed(1)}h
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {stats.daily_breakdown.length === 0 && (
        <div className="card p-8 text-center text-muted-foreground">
          <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nema evidencije radnih sati za izabrani period</p>
        </div>
      )}
    </div>
  );
}
