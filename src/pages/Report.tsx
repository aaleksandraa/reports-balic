import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { bs } from 'date-fns/locale';
import { Save, Send, FileDown } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { WeekSelector } from '@/components/dashboard/WeekSelector';
import { DayTabs } from '@/components/dashboard/DayTabs';
import { FiscalSection } from '@/components/report/FiscalSection';
import { NonFiscalSection } from '@/components/report/NonFiscalSection';
import { PatientsSection } from '@/components/report/PatientsSection';
import { CardPaymentSection } from '@/components/report/CardPaymentSection';
import { WireTransferSection } from '@/components/report/WireTransferSection';
import { AssociatesSection } from '@/components/report/AssociatesSection';
import { WorkScheduleSection } from '@/components/report/WorkScheduleSection';
import { UnpaidExamsSection } from '@/components/report/UnpaidExamsSection';
import { TodayPatientsSection } from '@/components/report/TodayPatientsSection';
import { PlannedProceduresSection } from '@/components/report/PlannedProceduresSection';
import { NotesSection } from '@/components/report/NotesSection';
import { SummarySection } from '@/components/report/SummarySection';
import { Button } from '@/components/ui/button';
import { useReport } from '@/contexts/ReportContext';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function Report() {
  const { locationId } = useParams<{ locationId: string }>();
  const { user, profile } = useAuth();
  const { 
    currentDate, 
    currentReport, 
    submitReport,
    setCurrentLocationId,
    setCurrentUser,
    refetchDoctors
  } = useReport();
  const [isExporting, setIsExporting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // Refetch doctors when component mounts to ensure fresh data
  useEffect(() => {
    refetchDoctors();
  }, [refetchDoctors]);
  
  // Set location and user when component mounts or when they change
  useEffect(() => {
    if (locationId) {
      setCurrentLocationId(locationId);
    }
  }, [locationId, setCurrentLocationId]);
  
  useEffect(() => {
    if (user && profile) {
      const userName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email || '';
      setCurrentUser(user.id, userName);
    }
  }, [user, profile, setCurrentUser]);
  
  const report = currentReport;

  const handleSave = () => {
    toast.success('Izvještaj je sačuvan kao nacrt');
  };

  const handleSubmit = async () => {
    if (!report.id) {
      toast.error('Izvještaj još nije kreiran');
      return;
    }
    
    setIsSending(true);
    try {
      await api.emailReport(report.id);
      submitReport();
      toast.success('Izvještaj je uspješno poslan na email!');
    } catch (error: any) {
      toast.error(error.message || 'Greška pri slanju izvještaja');
    } finally {
      setIsSending(false);
    }
  };

  const handleExport = async () => {
    if (!report.id) {
      toast.error('Izvještaj još nije kreiran');
      return;
    }
    
    setIsExporting(true);
    try {
      const blob = await api.exportReport(report.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `izvjestaj-${format(currentDate, 'yyyy-MM-dd')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Izvještaj je exportovan');
    } catch (error: any) {
      toast.error(error.message || 'Greška pri exportu');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <MainLayout>
      <div className="p-4 lg:p-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col gap-4 mb-4 lg:mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold">Dnevni izvještaj</h1>
                <p className="text-muted-foreground mt-1 text-sm lg:text-base">
                  {format(currentDate, 'EEEE, d. MMMM yyyy', { locale: bs })}
                </p>
              </div>
              {report.status === 'submitted' && (
                <span className="px-2 lg:px-3 py-1 rounded-full bg-success/10 text-success text-xs lg:text-sm font-medium whitespace-nowrap">
                  ✓ Poslano
                </span>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 lg:gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExport} 
                disabled={isExporting || !report.id}
                className="flex-1 sm:flex-none"
              >
                <FileDown className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{isExporting ? 'Exportujem...' : 'Export PDF'}</span>
                <span className="sm:hidden">{isExporting ? '...' : 'PDF'}</span>
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleSave} 
                className="flex-1 sm:flex-none"
              >
                <Save className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Sačuvaj</span>
              </Button>
              <Button 
                size="sm" 
                onClick={handleSubmit} 
                disabled={isSending || !report.id}
                className="gradient-primary flex-1 sm:flex-none"
              >
                <Send className="w-4 h-4 mr-2" />
                <span>{isSending ? 'Šaljem...' : 'Pošalji izvještaj'}</span>
              </Button>
            </div>
          </div>
          
          <WeekSelector />
        </div>

        {/* Day Tabs */}
        <div className="mb-6 lg:mb-8 overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
          <DayTabs />
        </div>

        {/* Report Sections */}
        <div className="space-y-4 lg:space-y-6">
          <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
            <FiscalSection />
            <NonFiscalSection />
          </div>

          <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
            <CardPaymentSection />
            <WireTransferSection />
          </div>

          <AssociatesSection />

          <TodayPatientsSection />

          <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
            <PatientsSection />
            <WorkScheduleSection />
          </div>

          <UnpaidExamsSection />
          
          <NotesSection />

          <PlannedProceduresSection />
          
          <SummarySection />
        </div>
      </div>
    </MainLayout>
  );
}
