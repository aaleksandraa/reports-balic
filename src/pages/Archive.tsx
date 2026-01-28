import { useState } from 'react';
import { format, startOfWeek, endOfWeek, subWeeks } from 'date-fns';
import { bs } from 'date-fns/locale';
import { Calendar, FileText, Download, Search, Filter } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useReport } from '@/contexts/ReportContext';

export default function Archive() {
  const { reports } = useReport();
  const [searchTerm, setSearchTerm] = useState('');

  // Group reports by week
  const groupedReports = reports.reduce((acc, report) => {
    const date = new Date(report.date);
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weekKey = format(weekStart, 'yyyy-MM-dd');
    
    if (!acc[weekKey]) {
      acc[weekKey] = {
        weekStart,
        weekEnd: endOfWeek(weekStart, { weekStartsOn: 1 }),
        reports: [],
      };
    }
    acc[weekKey].reports.push(report);
    return acc;
  }, {} as Record<string, { weekStart: Date; weekEnd: Date; reports: typeof reports }>);

  const weeks = Object.values(groupedReports).sort(
    (a, b) => b.weekStart.getTime() - a.weekStart.getTime()
  );

  // Demo data for empty state
  const demoWeeks = [
    { weekStart: subWeeks(new Date(), 1), weekEnd: endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }), reports: [] },
    { weekStart: subWeeks(new Date(), 2), weekEnd: endOfWeek(subWeeks(new Date(), 2), { weekStartsOn: 1 }), reports: [] },
  ];

  const displayWeeks = weeks.length > 0 ? weeks : demoWeeks;

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Arhiva</h1>
              <p className="text-muted-foreground mt-1">
                Pregled svih prethodnih izvještaja
              </p>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export sve
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži izvještaje..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filteri
            </Button>
          </div>
        </div>

        {/* Weeks List */}
        <div className="space-y-6">
          {displayWeeks.map((week) => (
            <div key={week.weekStart.toISOString()} className="section-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {format(week.weekStart, 'd. MMM', { locale: bs })} - {format(week.weekEnd, 'd. MMM yyyy', { locale: bs })}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {week.reports.length > 0 
                        ? `${week.reports.length} izvještaja`
                        : 'Nema izvještaja'}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Sedmični PDF
                </Button>
              </div>

              {week.reports.length > 0 ? (
                <div className="grid grid-cols-7 gap-2">
                  {week.reports.map((report) => (
                    <div
                      key={report.id}
                      className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    >
                      <p className="text-sm font-medium">
                        {format(new Date(report.date), 'EEE', { locale: bs })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(report.date), 'd. MMM', { locale: bs })}
                      </p>
                      {report.status === 'submitted' && (
                        <span className="inline-block mt-1 text-xs text-success">✓</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-2">
                  {['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'].map((day, idx) => (
                    <div
                      key={day}
                      className="p-3 rounded-lg bg-muted/30 text-center"
                    >
                      <p className="text-sm font-medium text-muted-foreground">{day}</p>
                      <p className="text-xs text-muted-foreground/50">-</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty state info */}
        {weeks.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Nema izvještaja u arhivi
            </h3>
            <p className="text-sm text-muted-foreground">
              Izvještaji će se pojaviti ovdje nakon što ih pošaljete
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
