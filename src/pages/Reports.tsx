import { useState, useMemo, useEffect } from 'react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { bs } from 'date-fns/locale';
import { Filter, X, Download, Send } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useDoctors } from '@/hooks/useDoctors';
import { useLocations } from '@/hooks/useLocations';
import { api } from '@/lib/api';

export default function Reports() {
  const { doctors } = useDoctors();
  const { locations } = useLocations();
  const [allReports, setAllReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    doctorId: '',
    locationId: '',
    roleFilter: 'all', // all, doctor, associate
    periodType: 'day', // day, week, month
    startDate: new Date(),
    endDate: new Date(),
    paymentTypes: {
      fiscal: true,
      nonFiscal: true,
      card: true,
      wire: true,
    },
    serviceFilter: '',
    minPrice: '',
    maxPrice: '',
    showPatients: true,
    showWorkSchedule: true,
  });

  // Load reports when date or location changes
  useEffect(() => {
    const loadReports = async () => {
      setIsLoading(true);
      try {
        const activeLocations = locations.filter(l => l.active);
        if (activeLocations.length === 0) {
          setAllReports([]);
          setIsLoading(false);
          return;
        }

        // Load reports for all active locations
        const allReportsData: any[] = [];
        for (const location of activeLocations) {
          try {
            const response = await api.getReportsByLocation(location.id, {
              start_date: format(filters.startDate, 'yyyy-MM-dd'),
            });
            if (Array.isArray(response)) {
              allReportsData.push(...response);
            }
          } catch (error) {
            console.error(`Error loading reports for location ${location.id}:`, error);
          }
        }
        setAllReports(allReportsData);
      } catch (error) {
        console.error('Error loading reports:', error);
        setAllReports([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadReports();
  }, [filters.startDate, locations]);

  // Get filtered data
  const filteredData = useMemo(() => {
    let startDate = filters.startDate;
    let endDate = filters.startDate;

    // Adjust dates based on period type
    if (filters.periodType === 'week') {
      startDate = startOfWeek(filters.startDate);
      endDate = endOfWeek(filters.startDate);
    } else if (filters.periodType === 'month') {
      startDate = startOfMonth(filters.startDate);
      endDate = endOfMonth(filters.startDate);
    } else {
      startDate = startOfDay(filters.startDate);
      endDate = endOfDay(filters.startDate);
    }

    // Aggregate all items from all reports in the date range
    let fiscalItems: any[] = [];
    let nonFiscalItems: any[] = [];
    let cardPayments: any[] = [];
    let wireTransfers: any[] = [];

    allReports.forEach(report => {
      const reportDate = new Date(report.date);
      if (isWithinInterval(reportDate, { start: startDate, end: endDate })) {
        // Filter by location if selected
        if (filters.locationId && report.locationId !== filters.locationId) {
          return;
        }

        // Aggregate fiscal items
        if (filters.paymentTypes.fiscal && report.fiscalItems) {
          fiscalItems.push(...report.fiscalItems);
        }

        // Aggregate non-fiscal items
        if (filters.paymentTypes.nonFiscal && report.nonFiscalItems) {
          nonFiscalItems.push(...report.nonFiscalItems);
        }

        // Aggregate card payments
        if (filters.paymentTypes.card && report.cardPayments) {
          cardPayments.push(...report.cardPayments);
        }

        // Aggregate wire transfers
        if (filters.paymentTypes.wire && report.wireTransfers) {
          wireTransfers.push(...report.wireTransfers);
        }
      }
    });

    // Apply doctor filter
    if (filters.doctorId) {
      fiscalItems = fiscalItems.filter(item => item.doctorId === filters.doctorId);
      nonFiscalItems = nonFiscalItems.filter(item => item.doctorId === filters.doctorId);
      cardPayments = cardPayments.filter(item => item.doctorId === filters.doctorId);
      wireTransfers = wireTransfers.filter(item => item.doctorId === filters.doctorId);
    }

    // Apply service filter
    if (filters.serviceFilter) {
      const searchTerm = filters.serviceFilter.toLowerCase();
      fiscalItems = fiscalItems.filter(item => item.serviceName?.toLowerCase().includes(searchTerm));
      nonFiscalItems = nonFiscalItems.filter(item => item.serviceName?.toLowerCase().includes(searchTerm));
      cardPayments = cardPayments.filter(item => item.serviceName?.toLowerCase().includes(searchTerm));
    }

    // Apply price range filter
    const minPrice = filters.minPrice ? parseFloat(filters.minPrice) : 0;
    const maxPrice = filters.maxPrice ? parseFloat(filters.maxPrice) : Infinity;
    
    fiscalItems = fiscalItems.filter(item => item.price >= minPrice && item.price <= maxPrice);
    nonFiscalItems = nonFiscalItems.filter(item => item.price >= minPrice && item.price <= maxPrice);
    cardPayments = cardPayments.filter(item => item.price >= minPrice && item.price <= maxPrice);
    wireTransfers = wireTransfers.filter(item => item.price >= minPrice && item.price <= maxPrice);

    // Calculate totals
    const totalFiscal = fiscalItems.reduce((sum, item) => sum + (item.price || 0), 0);
    const totalNonFiscal = nonFiscalItems.reduce((sum, item) => sum + (item.price || 0), 0);
    const totalCard = cardPayments.reduce((sum, item) => sum + (item.price || 0), 0);
    const totalWire = wireTransfers.reduce((sum, item) => sum + (item.price || 0), 0);
    const grandTotal = totalFiscal + totalNonFiscal + totalCard + totalWire;

    return {
      fiscalItems,
      nonFiscalItems,
      cardPayments,
      wireTransfers,
      totalFiscal,
      totalNonFiscal,
      totalCard,
      totalWire,
      grandTotal,
    };
  }, [filters, allReports]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePaymentTypeChange = (type: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      paymentTypes: {
        ...prev.paymentTypes,
        [type]: checked,
      },
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      doctorId: '',
      locationId: '',
      roleFilter: 'all',
      periodType: 'day',
      startDate: new Date(),
      endDate: new Date(),
      paymentTypes: {
        fiscal: true,
        nonFiscal: true,
        card: true,
        wire: true,
      },
      serviceFilter: '',
      minPrice: '',
      maxPrice: '',
      showPatients: true,
      showWorkSchedule: true,
    });
  };

  return (
    <MainLayout>
      <div className="p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Napredni filtri izvještaja</h1>
          <p className="text-muted-foreground">Prilagođeni pregled sa svim mogućim filterima</p>
        </div>

        {/* Filters Section */}
        <div className="section-card mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Filtri</h2>
          </div>

          <div className="space-y-6">
            {/* Row 1: Doctor/Associate, Period Type, Date */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Lokacija</label>
                <Select value={filters.locationId || 'all'} onValueChange={(value) => handleFilterChange('locationId', value === 'all' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sve lokacije" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Sve lokacije</SelectItem>
                    {locations.filter(l => l.active).map(location => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Doktor / Saradnik</label>
                <Select value={filters.doctorId || 'all'} onValueChange={(value) => handleFilterChange('doctorId', value === 'all' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Svi doktori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Svi doktori</SelectItem>
                    {doctors.filter(d => d.active).map(doctor => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.first_name} {doctor.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Tip perioda</label>
                <Select value={filters.periodType} onValueChange={(value) => handleFilterChange('periodType', value)}>
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

              <div>
                <label className="text-sm font-medium mb-2 block">Datum</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      {format(filters.startDate, 'dd.MM.yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={filters.startDate}
                      onSelect={(date) => date && handleFilterChange('startDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Row 2: Payment Types */}
            <div>
              <label className="text-sm font-medium mb-3 block">Tipovi plaćanja</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={filters.paymentTypes.fiscal}
                    onCheckedChange={(checked) => handlePaymentTypeChange('fiscal', checked as boolean)}
                  />
                  <label className="text-sm cursor-pointer">Fiskalno</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={filters.paymentTypes.nonFiscal}
                    onCheckedChange={(checked) => handlePaymentTypeChange('nonFiscal', checked as boolean)}
                  />
                  <label className="text-sm cursor-pointer">Nefiskalno</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={filters.paymentTypes.card}
                    onCheckedChange={(checked) => handlePaymentTypeChange('card', checked as boolean)}
                  />
                  <label className="text-sm cursor-pointer">Kartično</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={filters.paymentTypes.wire}
                    onCheckedChange={(checked) => handlePaymentTypeChange('wire', checked as boolean)}
                  />
                  <label className="text-sm cursor-pointer">Žiralno</label>
                </div>
              </div>
            </div>

            {/* Row 3: Service Filter and Price Range */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Pretraga usluge</label>
                <Input
                  placeholder="Naziv usluge..."
                  value={filters.serviceFilter}
                  onChange={(e) => handleFilterChange('serviceFilter', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Min. cijena (KM)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Max. cijena (KM)</label>
                <Input
                  type="number"
                  placeholder="10000"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </div>
            </div>

            {/* Row 4: Additional Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={filters.showPatients}
                  onCheckedChange={(checked) => handleFilterChange('showPatients', checked as boolean)}
                />
                <label className="text-sm cursor-pointer">Prikaži pacijente</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={filters.showWorkSchedule}
                  onCheckedChange={(checked) => handleFilterChange('showWorkSchedule', checked as boolean)}
                />
                <label className="text-sm cursor-pointer">Prikaži radni raspored</label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={handleResetFilters}>
                <X className="w-4 h-4 mr-2" />
                Resetuj filtere
              </Button>
              <Button className="gradient-primary">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button className="gradient-primary">
                <Send className="w-4 h-4 mr-2" />
                Pošalji
              </Button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {filters.paymentTypes.fiscal && (
              <div className="section-card p-4">
                <p className="text-sm text-muted-foreground mb-1">Fiskalno</p>
                <p className="text-2xl font-bold text-fiscal">{filteredData.totalFiscal.toFixed(2)} KM</p>
              </div>
            )}
            {filters.paymentTypes.nonFiscal && (
              <div className="section-card p-4">
                <p className="text-sm text-muted-foreground mb-1">Nefiskalno</p>
                <p className="text-2xl font-bold text-non-fiscal">{filteredData.totalNonFiscal.toFixed(2)} KM</p>
              </div>
            )}
            {filters.paymentTypes.card && (
              <div className="section-card p-4">
                <p className="text-sm text-muted-foreground mb-1">Kartično</p>
                <p className="text-2xl font-bold text-card-payment">{filteredData.totalCard.toFixed(2)} KM</p>
              </div>
            )}
            {filters.paymentTypes.wire && (
              <div className="section-card p-4">
                <p className="text-sm text-muted-foreground mb-1">Žiralno</p>
                <p className="text-2xl font-bold text-wire-transfer">{filteredData.totalWire.toFixed(2)} KM</p>
              </div>
            )}
          </div>

          {/* Grand Total */}
          <div className="section-card p-6 bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">UKUPNO</p>
                <p className="text-3xl font-bold text-gradient">{filteredData.grandTotal.toFixed(2)} KM</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Period: {format(filters.startDate, 'dd.MM.yyyy', { locale: bs })}</p>
                <p className="text-sm text-muted-foreground">Tip: {
                  filters.periodType === 'day' ? 'Dnevno' :
                  filters.periodType === 'week' ? 'Sedmično' : 'Mjesečno'
                }</p>
              </div>
            </div>
          </div>

          {/* Fiscal Items */}
          {filters.paymentTypes.fiscal && filteredData.fiscalItems.length > 0 && (
            <div className="section-card">
              <h3 className="font-semibold text-lg mb-4">Fiskalne stavke ({filteredData.fiscalItems.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 font-medium">Usluga</th>
                      <th className="text-right py-2 px-2 font-medium">Broj</th>
                      <th className="text-right py-2 px-2 font-medium">Cijena</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.fiscalItems.map((item: any, idx) => (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="py-2 px-2">{item.serviceName || item.service_name || ''}</td>
                        <td className="py-2 px-2 text-right">1</td>
                        <td className="py-2 px-2 text-right font-medium">{(item.price || 0).toFixed(2)} KM</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Non-Fiscal Items */}
          {filters.paymentTypes.nonFiscal && filteredData.nonFiscalItems.length > 0 && (
            <div className="section-card">
              <h3 className="font-semibold text-lg mb-4">Nefiskalne stavke ({filteredData.nonFiscalItems.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 font-medium">Usluga</th>
                      <th className="text-right py-2 px-2 font-medium">Broj</th>
                      <th className="text-right py-2 px-2 font-medium">Cijena</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.nonFiscalItems.map((item: any, idx) => (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="py-2 px-2">{item.serviceName || item.service_name || ''}</td>
                        <td className="py-2 px-2 text-right">1</td>
                        <td className="py-2 px-2 text-right font-medium">{(item.price || 0).toFixed(2)} KM</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Card Payments */}
          {filters.paymentTypes.card && filteredData.cardPayments.length > 0 && (
            <div className="section-card">
              <h3 className="font-semibold text-lg mb-4">Kartična plaćanja ({filteredData.cardPayments.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 font-medium">Usluga</th>
                      <th className="text-right py-2 px-2 font-medium">Broj</th>
                      <th className="text-right py-2 px-2 font-medium">Cijena</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.cardPayments.map((item: any, idx) => (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="py-2 px-2">{item.serviceName || item.service_name || ''}</td>
                        <td className="py-2 px-2 text-right">1</td>
                        <td className="py-2 px-2 text-right font-medium">{(item.price || 0).toFixed(2)} KM</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Wire Transfers */}
          {filters.paymentTypes.wire && filteredData.wireTransfers.length > 0 && (
            <div className="section-card">
              <h3 className="font-semibold text-lg mb-4">Žiralne uplate ({filteredData.wireTransfers.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 font-medium">Pacijent</th>
                      <th className="text-right py-2 px-2 font-medium">Broj</th>
                      <th className="text-right py-2 px-2 font-medium">Cijena</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.wireTransfers.map((item: any, idx) => (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="py-2 px-2">{item.patientName || item.patient_name || ''}</td>
                        <td className="py-2 px-2 text-right">1</td>
                        <td className="py-2 px-2 text-right font-medium">{(item.price || 0).toFixed(2)} KM</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* No Results */}
          {filteredData.grandTotal === 0 && (
            <div className="section-card p-8 text-center">
              <p className="text-muted-foreground">Nema rezultata za odabrane filtere</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
