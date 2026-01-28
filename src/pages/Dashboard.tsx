import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { bs } from 'date-fns/locale';
import { 
  Receipt, 
  FileX, 
  CreditCard, 
  Building2, 
  Users, 
  TrendingUp,
  FileText,
  FileDown,
  Send
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { WeekSelector } from '@/components/dashboard/WeekSelector';
import { DayTabs } from '@/components/dashboard/DayTabs';
import { useReport } from '@/contexts/ReportContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

export default function Dashboard() {
  const { locationId } = useParams<{ locationId: string }>();
  const { user } = useAuth();
  const { 
    currentDate, 
    currentReport,
    calculateTotals, 
    doctors, 
    setCurrentLocationId,
    setCurrentUser,
    refetchDoctors
  } = useReport();
  const navigate = useNavigate();
  const totals = calculateTotals();
  const activeDoctors = doctors.filter(d => d.role === 'doctor' && d.active);

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
    if (user) {
      const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || '';
      setCurrentUser(user.id, userName);
    }
  }, [user, setCurrentUser]);

  const handleNewReport = () => {
    if (locationId) {
      navigate(`/location/${locationId}/report`);
    }
  };

  return (
    <MainLayout>
      <div className="p-4 lg:p-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 lg:mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gradient">Dashboard</h1>
              <p className="text-muted-foreground mt-1 text-sm lg:text-base">
                Pregled za {format(currentDate, 'EEEE, d. MMMM yyyy', { locale: bs })}
              </p>
            </div>
            {locationId && (
              <Button onClick={handleNewReport} size="lg" className="gradient-primary w-full sm:w-auto">
                <FileText className="w-5 h-5 mr-2" />
                Novi izvještaj
              </Button>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <WeekSelector />
          </div>
        </div>

        {/* Day Tabs */}
        <div className="mb-6 lg:mb-8 overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
          <DayTabs />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
          <StatCard
            title="Fiskalno"
            value={`${totals.totalFiscal.toFixed(2)} KM`}
            icon={Receipt}
            variant="fiscal"
          />
          <StatCard
            title="Nefiskalno"
            value={`${totals.totalNonFiscal.toFixed(2)} KM`}
            icon={FileX}
            variant="non-fiscal"
          />
          <StatCard
            title="Kartično"
            value={`${totals.totalCardPayments.toFixed(2)} KM`}
            icon={CreditCard}
            variant="card-payment"
          />
          <StatCard
            title="Žiralno"
            value={`${totals.totalWireTransfers.toFixed(2)} KM`}
            icon={Building2}
            variant="wire-transfer"
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {/* Total Revenue */}
          <div className="section-card lg:col-span-2">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h3 className="font-semibold text-base lg:text-lg">Ukupni prihod</h3>
              <div className="flex items-center gap-2 text-success">
                <TrendingUp className="w-4 lg:w-5 h-4 lg:h-5" />
                <span className="font-medium text-sm lg:text-base">Danas</span>
              </div>
            </div>
            <div className="text-center py-6 lg:py-8">
              <p className="text-3xl lg:text-5xl font-bold text-gradient mb-2">
                {totals.grandTotal.toFixed(2)} KM
              </p>
              <p className="text-muted-foreground text-sm lg:text-base">Ukupno za odabrani dan</p>
            </div>
            <div className="grid grid-cols-4 gap-2 lg:gap-4 mt-4 lg:mt-6 pt-4 lg:pt-6 border-t">
              <div className="text-center">
                <p className="text-lg lg:text-2xl font-bold text-fiscal">{totals.totalFiscal.toFixed(0)}</p>
                <p className="text-[10px] lg:text-xs text-muted-foreground">Fiskalno</p>
              </div>
              <div className="text-center">
                <p className="text-lg lg:text-2xl font-bold text-non-fiscal">{totals.totalNonFiscal.toFixed(0)}</p>
                <p className="text-[10px] lg:text-xs text-muted-foreground">Nefiskalno</p>
              </div>
              <div className="text-center">
                <p className="text-lg lg:text-2xl font-bold text-card-payment">{totals.totalCardPayments.toFixed(0)}</p>
                <p className="text-[10px] lg:text-xs text-muted-foreground">Kartično</p>
              </div>
              <div className="text-center">
                <p className="text-lg lg:text-2xl font-bold text-wire-transfer">{totals.totalWireTransfers.toFixed(0)}</p>
                <p className="text-[10px] lg:text-xs text-muted-foreground">Žiralno</p>
              </div>
            </div>
          </div>

          {/* Doctors Stats */}
          <div className="section-card">
            <div className="flex items-center gap-3 mb-4 lg:mb-6">
              <Users className="w-4 lg:w-5 h-4 lg:h-5 text-primary" />
              <h3 className="font-semibold text-base lg:text-lg">Pregledi po doktoru</h3>
            </div>
            <div className="space-y-3 lg:space-y-4">
              {activeDoctors.map(doc => {
                const count = totals.examsByDoctor[doc.id] || 0;
                const maxCount = Math.max(...Object.values(totals.examsByDoctor), 1);
                const percentage = (count / maxCount) * 100;
                
                return (
                  <div key={doc.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 lg:w-8 h-7 lg:h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-[10px] lg:text-xs font-semibold text-primary">{doc.initials}</span>
                        </div>
                        <span className="font-medium text-sm lg:text-base">{doc.firstName}</span>
                      </div>
                      <span className="font-bold text-sm lg:text-base">{count}</span>
                    </div>
                    <div className="h-1.5 lg:h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full gradient-primary rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 lg:mt-6 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm lg:text-base">Ukupno pregleda</span>
                <span className="text-xl lg:text-2xl font-bold">
                  {Object.values(totals.examsByDoctor).reduce((a, b) => a + b, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Sections */}
        <div className="space-y-4 lg:space-y-6">
          {/* Notes Section */}
          {currentReport.notes && (
            <div className="section-card">
              <h3 className="font-semibold text-base lg:text-lg mb-4">Napomene</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {currentReport.notes}
              </p>
            </div>
          )}

          {/* Detailed Report by Doctor */}
          <div className="section-card">
            <h3 className="font-semibold text-base lg:text-lg mb-4">Detaljni pregled po doktorima</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Doctors */}
              {doctors.filter(d => d.role === 'doctor' && d.active).map(doctor => {
              const doctorExams: { service: string; count: number; price: number; type: string }[] = [];
              
              // Fiscal items
              currentReport.fiscalItems?.forEach(item => {
                const count = item.doctorCounts[doctor.id] || 0;
                if (count > 0) {
                  const totalCount = Object.values(item.doctorCounts).reduce((a, b) => a + b, 0);
                  const pricePerExam = totalCount > 0 ? item.price / totalCount : 0;
                  doctorExams.push({
                    service: item.serviceName,
                    count,
                    price: pricePerExam * count,
                    type: 'Fiskalno'
                  });
                }
              });
              
              // Non-fiscal items
              currentReport.nonFiscalItems?.forEach(item => {
                const count = item.doctorCounts[doctor.id] || 0;
                if (count > 0) {
                  const totalCount = Object.values(item.doctorCounts).reduce((a, b) => a + b, 0);
                  const pricePerExam = totalCount > 0 ? item.price / totalCount : 0;
                  doctorExams.push({
                    service: item.serviceName,
                    count,
                    price: pricePerExam * count,
                    type: 'Nefiskalno'
                  });
                }
              });
              
              // Card payments
              currentReport.cardPayments?.forEach(item => {
                const count = item.doctorCounts[doctor.id] || 0;
                if (count > 0) {
                  const totalCount = Object.values(item.doctorCounts).reduce((a, b) => a + b, 0);
                  const pricePerExam = totalCount > 0 ? item.price / totalCount : 0;
                  doctorExams.push({
                    service: item.serviceName,
                    count,
                    price: pricePerExam * count,
                    type: 'Kartično'
                  });
                }
              });
              
              // Wire transfers
              currentReport.wireTransfers?.forEach(item => {
                const count = item.doctorCounts[doctor.id] || 0;
                if (count > 0) {
                  const totalCount = Object.values(item.doctorCounts).reduce((a, b) => a + b, 0);
                  const pricePerExam = totalCount > 0 ? item.price / totalCount : 0;
                  doctorExams.push({
                    service: item.patientName,
                    count,
                    price: pricePerExam * count,
                    type: 'Žiralno'
                  });
                }
              });
              
              if (doctorExams.length === 0) return null;
              
              const totalExams = doctorExams.reduce((sum, exam) => sum + exam.count, 0);
              const totalRevenue = doctorExams.reduce((sum, exam) => sum + exam.price, 0);
              
              return (
                <div key={doctor.id} className="mb-6 last:mb-0">
                  <div className="flex items-center gap-3 mb-3 pb-2 border-b-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">{doctor.initials}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{doctor.firstName} {doctor.lastName}</h4>
                      <p className="text-xs text-muted-foreground">Doktor</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{totalExams} pregleda</p>
                      <p className="text-xs text-muted-foreground">{totalRevenue.toFixed(2)} KM</p>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2 font-medium">Usluga</th>
                          <th className="text-left py-2 px-2 font-medium">Tip</th>
                          <th className="text-right py-2 px-2 font-medium">Broj</th>
                          <th className="text-right py-2 px-2 font-medium">Cijena</th>
                        </tr>
                      </thead>
                      <tbody>
                        {doctorExams.map((exam, idx) => (
                          <tr key={idx} className="border-b last:border-0">
                            <td className="py-2 px-2">{exam.service}</td>
                            <td className="py-2 px-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                exam.type === 'Fiskalno' ? 'bg-fiscal/10 text-fiscal' :
                                exam.type === 'Nefiskalno' ? 'bg-non-fiscal/10 text-non-fiscal' :
                                exam.type === 'Kartično' ? 'bg-card-payment/10 text-card-payment' :
                                'bg-wire-transfer/10 text-wire-transfer'
                              }`}>
                                {exam.type}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-right">{exam.count}</td>
                            <td className="py-2 px-2 text-right font-medium">{exam.price.toFixed(2)} KM</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 font-semibold">
                          <td colSpan={2} className="py-2 px-2">UKUPNO</td>
                          <td className="py-2 px-2 text-right">{totalExams}</td>
                          <td className="py-2 px-2 text-right">{totalRevenue.toFixed(2)} KM</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              );
            })}
            </div>
            
            {/* Doctor Total */}
            {doctors.filter(d => d.role === 'doctor' && d.active).some(doctor => {
              const hasExams = currentReport.fiscalItems?.some(item => (item.doctorCounts[doctor.id] || 0) > 0) ||
                              currentReport.nonFiscalItems?.some(item => (item.doctorCounts[doctor.id] || 0) > 0) ||
                              currentReport.cardPayments?.some(item => (item.doctorCounts[doctor.id] || 0) > 0) ||
                              currentReport.wireTransfers?.some(item => (item.doctorCounts[doctor.id] || 0) > 0);
              return hasExams;
            }) && (
              <div className="mt-6 pt-4 border-t-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-lg">UKUPNO DOKTORI</h4>
                    <p className="text-sm text-muted-foreground">
                      {doctors.filter(d => d.role === 'doctor' && d.active).reduce((sum, doctor) => {
                        return sum + (totals.examsByDoctor[doctor.id] || 0);
                      }, 0)} pregleda
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gradient">
                      {doctors.filter(d => d.role === 'doctor' && d.active).reduce((sum, doctor) => {
                        let doctorTotal = 0;
                        currentReport.fiscalItems?.forEach(item => {
                          const count = item.doctorCounts[doctor.id] || 0;
                          if (count > 0) {
                            const totalCount = Object.values(item.doctorCounts).reduce((a, b) => a + b, 0);
                            const pricePerExam = totalCount > 0 ? item.price / totalCount : 0;
                            doctorTotal += pricePerExam * count;
                          }
                        });
                        currentReport.nonFiscalItems?.forEach(item => {
                          const count = item.doctorCounts[doctor.id] || 0;
                          if (count > 0) {
                            const totalCount = Object.values(item.doctorCounts).reduce((a, b) => a + b, 0);
                            const pricePerExam = totalCount > 0 ? item.price / totalCount : 0;
                            doctorTotal += pricePerExam * count;
                          }
                        });
                        currentReport.cardPayments?.forEach(item => {
                          const count = item.doctorCounts[doctor.id] || 0;
                          if (count > 0) {
                            const totalCount = Object.values(item.doctorCounts).reduce((a, b) => a + b, 0);
                            const pricePerExam = totalCount > 0 ? item.price / totalCount : 0;
                            doctorTotal += pricePerExam * count;
                          }
                        });
                        currentReport.wireTransfers?.forEach(item => {
                          const count = item.doctorCounts[doctor.id] || 0;
                          if (count > 0) {
                            const totalCount = Object.values(item.doctorCounts).reduce((a, b) => a + b, 0);
                            const pricePerExam = totalCount > 0 ? item.price / totalCount : 0;
                            doctorTotal += pricePerExam * count;
                          }
                        });
                        return sum + doctorTotal;
                      }, 0).toFixed(2)} KM
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Detailed Report by Associates */}
          <div className="section-card">
            <h3 className="font-semibold text-base lg:text-lg mb-4">Detaljni pregled po saradnicima</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Associates */}
              {doctors.filter(d => d.role === 'associate' && d.active).map(associate => {
              const associateExams: { service: string; count: number; price: number; type: string }[] = [];
              
              // Check all items for this associate
              currentReport.fiscalItems?.forEach(item => {
                const count = item.doctorCounts[associate.id] || 0;
                if (count > 0) {
                  const totalCount = Object.values(item.doctorCounts).reduce((a, b) => a + b, 0);
                  const pricePerExam = totalCount > 0 ? item.price / totalCount : 0;
                  associateExams.push({
                    service: item.serviceName,
                    count,
                    price: pricePerExam * count,
                    type: 'Fiskalno'
                  });
                }
              });
              
              currentReport.nonFiscalItems?.forEach(item => {
                const count = item.doctorCounts[associate.id] || 0;
                if (count > 0) {
                  const totalCount = Object.values(item.doctorCounts).reduce((a, b) => a + b, 0);
                  const pricePerExam = totalCount > 0 ? item.price / totalCount : 0;
                  associateExams.push({
                    service: item.serviceName,
                    count,
                    price: pricePerExam * count,
                    type: 'Nefiskalno'
                  });
                }
              });
              
              currentReport.cardPayments?.forEach(item => {
                const count = item.doctorCounts[associate.id] || 0;
                if (count > 0) {
                  const totalCount = Object.values(item.doctorCounts).reduce((a, b) => a + b, 0);
                  const pricePerExam = totalCount > 0 ? item.price / totalCount : 0;
                  associateExams.push({
                    service: item.serviceName,
                    count,
                    price: pricePerExam * count,
                    type: 'Kartično'
                  });
                }
              });
              
              currentReport.wireTransfers?.forEach(item => {
                const count = item.doctorCounts[associate.id] || 0;
                if (count > 0) {
                  const totalCount = Object.values(item.doctorCounts).reduce((a, b) => a + b, 0);
                  const pricePerExam = totalCount > 0 ? item.price / totalCount : 0;
                  associateExams.push({
                    service: item.patientName,
                    count,
                    price: pricePerExam * count,
                    type: 'Žiralno'
                  });
                }
              });
              
              if (associateExams.length === 0) return null;
              
              const totalExams = associateExams.reduce((sum, exam) => sum + exam.count, 0);
              const totalRevenue = associateExams.reduce((sum, exam) => sum + exam.price, 0);
              
              return (
                <div key={associate.id} className="mb-6 last:mb-0">
                  <div className="flex items-center gap-3 mb-3 pb-2 border-b-2">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-purple-600">{associate.initials}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{associate.firstName} {associate.lastName}</h4>
                      <p className="text-xs text-muted-foreground">Saradnik</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{totalExams} pregleda</p>
                      <p className="text-xs text-muted-foreground">{totalRevenue.toFixed(2)} KM</p>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2 font-medium">Usluga</th>
                          <th className="text-left py-2 px-2 font-medium">Tip</th>
                          <th className="text-right py-2 px-2 font-medium">Broj</th>
                          <th className="text-right py-2 px-2 font-medium">Cijena</th>
                        </tr>
                      </thead>
                      <tbody>
                        {associateExams.map((exam, idx) => (
                          <tr key={idx} className="border-b last:border-0">
                            <td className="py-2 px-2">{exam.service}</td>
                            <td className="py-2 px-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                exam.type === 'Fiskalno' ? 'bg-fiscal/10 text-fiscal' :
                                exam.type === 'Nefiskalno' ? 'bg-non-fiscal/10 text-non-fiscal' :
                                exam.type === 'Kartično' ? 'bg-card-payment/10 text-card-payment' :
                                'bg-wire-transfer/10 text-wire-transfer'
                              }`}>
                                {exam.type}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-right">{exam.count}</td>
                            <td className="py-2 px-2 text-right font-medium">{exam.price.toFixed(2)} KM</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 font-semibold">
                          <td colSpan={2} className="py-2 px-2">UKUPNO</td>
                          <td className="py-2 px-2 text-right">{totalExams}</td>
                          <td className="py-2 px-2 text-right">{totalRevenue.toFixed(2)} KM</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              );
            })}
            </div>
            
            {/* Associates Total */}
            {doctors.filter(d => d.role === 'associate' && d.active).some(associate => {
              const hasExams = currentReport.fiscalItems?.some(item => (item.doctorCounts[associate.id] || 0) > 0) ||
                              currentReport.nonFiscalItems?.some(item => (item.doctorCounts[associate.id] || 0) > 0) ||
                              currentReport.cardPayments?.some(item => (item.doctorCounts[associate.id] || 0) > 0) ||
                              currentReport.wireTransfers?.some(item => (item.doctorCounts[associate.id] || 0) > 0);
              return hasExams;
            }) && (
              <div className="mt-6 pt-4 border-t-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-lg">UKUPNO SARADNICI</h4>
                    <p className="text-sm text-muted-foreground">
                      {doctors.filter(d => d.role === 'associate' && d.active).reduce((sum, associate) => {
                        return sum + (totals.examsByDoctor[associate.id] || 0);
                      }, 0)} pregleda
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gradient">
                      {doctors.filter(d => d.role === 'associate' && d.active).reduce((sum, associate) => {
                        let associateTotal = 0;
                        currentReport.fiscalItems?.forEach(item => {
                          const count = item.doctorCounts[associate.id] || 0;
                          if (count > 0) {
                            const totalCount = Object.values(item.doctorCounts).reduce((a, b) => a + b, 0);
                            const pricePerExam = totalCount > 0 ? item.price / totalCount : 0;
                            associateTotal += pricePerExam * count;
                          }
                        });
                        currentReport.nonFiscalItems?.forEach(item => {
                          const count = item.doctorCounts[associate.id] || 0;
                          if (count > 0) {
                            const totalCount = Object.values(item.doctorCounts).reduce((a, b) => a + b, 0);
                            const pricePerExam = totalCount > 0 ? item.price / totalCount : 0;
                            associateTotal += pricePerExam * count;
                          }
                        });
                        currentReport.cardPayments?.forEach(item => {
                          const count = item.doctorCounts[associate.id] || 0;
                          if (count > 0) {
                            const totalCount = Object.values(item.doctorCounts).reduce((a, b) => a + b, 0);
                            const pricePerExam = totalCount > 0 ? item.price / totalCount : 0;
                            associateTotal += pricePerExam * count;
                          }
                        });
                        currentReport.wireTransfers?.forEach(item => {
                          const count = item.doctorCounts[associate.id] || 0;
                          if (count > 0) {
                            const totalCount = Object.values(item.doctorCounts).reduce((a, b) => a + b, 0);
                            const pricePerExam = totalCount > 0 ? item.price / totalCount : 0;
                            associateTotal += pricePerExam * count;
                          }
                        });
                        return sum + associateTotal;
                      }, 0).toFixed(2)} KM
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Grand Total - All */}
          <div className="section-card">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-lg">UKUPNO SVI</h4>
                <p className="text-sm text-muted-foreground">
                  {Object.values(totals.examsByDoctor).reduce((a, b) => a + b, 0)} pregleda
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gradient">
                  {(() => {
                    // Calculate total for all doctors
                    const doctorsTotal = doctors.filter(d => d.role === 'doctor' && d.active).reduce((sum, doctor) => {
                      let doctorTotal = 0;
                      currentReport.fiscalItems?.forEach(item => {
                        const count = item.doctorCounts[doctor.id] || 0;
                        if (count > 0) {
                          const totalCount = Object.values(item.doctorCounts).reduce((a, b) => a + b, 0);
                          const pricePerExam = totalCount > 0 ? item.price / totalCount : 0;
                          doctorTotal += pricePerExam * count;
                        }
                      });
                      currentReport.nonFiscalItems?.forEach(item => {
                        const count = item.doctorCounts[doctor.id] || 0;
                        if (count > 0) {
                          const totalCount = Object.values(item.doctorCounts).reduce((a, b) => a + b, 0);
                          const pricePerExam = totalCount > 0 ? item.price / totalCount : 0;
                          doctorTotal += pricePerExam * count;
                        }
                      });
                      currentReport.cardPayments?.forEach(item => {
                        const count = item.doctorCounts[doctor.id] || 0;
                        if (count > 0) {
                          const totalCount = Object.values(item.doctorCounts).reduce((a, b) => a + b, 0);
                          const pricePerExam = totalCount > 0 ? item.price / totalCount : 0;
                          doctorTotal += pricePerExam * count;
                        }
                      });
                      currentReport.wireTransfers?.forEach(item => {
                        const count = item.doctorCounts[doctor.id] || 0;
                        if (count > 0) {
                          const totalCount = Object.values(item.doctorCounts).reduce((a, b) => a + b, 0);
                          const pricePerExam = totalCount > 0 ? item.price / totalCount : 0;
                          doctorTotal += pricePerExam * count;
                        }
                      });
                      return sum + doctorTotal;
                    }, 0);

                    // Calculate total for all associates
                    const associatesTotal = doctors.filter(d => d.role === 'associate' && d.active).reduce((sum, associate) => {
                      let associateTotal = 0;
                      currentReport.fiscalItems?.forEach(item => {
                        const count = item.doctorCounts[associate.id] || 0;
                        if (count > 0) {
                          const totalCount = Object.values(item.doctorCounts).reduce((a, b) => a + b, 0);
                          const pricePerExam = totalCount > 0 ? item.price / totalCount : 0;
                          associateTotal += pricePerExam * count;
                        }
                      });
                      currentReport.nonFiscalItems?.forEach(item => {
                        const count = item.doctorCounts[associate.id] || 0;
                        if (count > 0) {
                          const totalCount = Object.values(item.doctorCounts).reduce((a, b) => a + b, 0);
                          const pricePerExam = totalCount > 0 ? item.price / totalCount : 0;
                          associateTotal += pricePerExam * count;
                        }
                      });
                      currentReport.cardPayments?.forEach(item => {
                        const count = item.doctorCounts[associate.id] || 0;
                        if (count > 0) {
                          const totalCount = Object.values(item.doctorCounts).reduce((a, b) => a + b, 0);
                          const pricePerExam = totalCount > 0 ? item.price / totalCount : 0;
                          associateTotal += pricePerExam * count;
                        }
                      });
                      currentReport.wireTransfers?.forEach(item => {
                        const count = item.doctorCounts[associate.id] || 0;
                        if (count > 0) {
                          const totalCount = Object.values(item.doctorCounts).reduce((a, b) => a + b, 0);
                          const pricePerExam = totalCount > 0 ? item.price / totalCount : 0;
                          associateTotal += pricePerExam * count;
                        }
                      });
                      return sum + associateTotal;
                    }, 0);

                    return (doctorsTotal + associatesTotal).toFixed(2);
                  })()}
                  {' KM'}
                </p>
              </div>
            </div>
          </div>

          {/* Patients Section */}
          {currentReport.patients && currentReport.patients.length > 0 && (
            <div className="section-card">
              <h3 className="font-semibold text-base lg:text-lg mb-4">
                Novi pacijenti ({currentReport.patients.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 text-sm font-medium">Ime i prezime</th>
                      <th className="text-left py-2 px-2 text-sm font-medium">Grad</th>
                      <th className="text-left py-2 px-2 text-sm font-medium">Razlog</th>
                      <th className="text-left py-2 px-2 text-sm font-medium">Doktor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentReport.patients.map((patient) => {
                      const doctor = doctors.find(d => d.id === patient.doctorId);
                      return (
                        <tr key={patient.id} className="border-b last:border-0">
                          <td className="py-2 px-2 text-sm">{patient.fullName}</td>
                          <td className="py-2 px-2 text-sm text-muted-foreground">{patient.city}</td>
                          <td className="py-2 px-2 text-sm">{patient.reason}</td>
                          <td className="py-2 px-2 text-sm">
                            {doctor ? `${doctor.firstName} ${doctor.lastName}` : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Work Schedule Section */}
          {currentReport.workSchedule && currentReport.workSchedule.length > 0 && (
            <div className="section-card">
              <h3 className="font-semibold text-base lg:text-lg mb-4">
                Radni raspored ({currentReport.workSchedule.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 text-sm font-medium">Radnik</th>
                      <th className="text-left py-2 px-2 text-sm font-medium">Dolazak</th>
                      <th className="text-left py-2 px-2 text-sm font-medium">Odlazak</th>
                      <th className="text-right py-2 px-2 text-sm font-medium">Sati</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentReport.workSchedule.map((item) => (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="py-2 px-2 text-sm">{item.employeeName}</td>
                        <td className="py-2 px-2 text-sm text-muted-foreground">{item.arrivalTime}</td>
                        <td className="py-2 px-2 text-sm text-muted-foreground">{item.departureTime}</td>
                        <td className="py-2 px-2 text-sm text-right font-medium">
                          {item.hoursWorked.toFixed(1)}h
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 font-semibold">
                      <td colSpan={3} className="py-2 px-2 text-sm">UKUPNO</td>
                      <td className="py-2 px-2 text-sm text-right">
                        {currentReport.workSchedule.reduce((sum, item) => sum + item.hoursWorked, 0).toFixed(1)}h
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Export and Send Buttons */}
          {currentReport.id && (
            <div className="section-card">
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="outline" 
                  onClick={async () => {
                    try {
                      const blob = await api.exportReport(currentReport.id);
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `izvjestaj-${format(currentDate, 'yyyy-MM-dd')}.pdf`;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);
                    } catch (error: any) {
                      console.error('Export error:', error);
                    }
                  }}
                  className="flex-1 sm:flex-none"
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
                <Button 
                  onClick={async () => {
                    try {
                      await api.emailReport(currentReport.id);
                      alert('Izvještaj je poslan na email!');
                    } catch (error: any) {
                      alert('Greška: ' + error.message);
                    }
                  }}
                  className="gradient-primary flex-1 sm:flex-none"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Pošalji izvještaj
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
