import { Calculator, TrendingUp, Users } from 'lucide-react';
import { useReport } from '@/contexts/ReportContext';

export function SummarySection() {
  const { doctors, calculateTotals } = useReport();
  const totals = calculateTotals();
  const activeDoctors = doctors.filter(d => d.role === 'doctor' && d.active);

  return (
    <div className="section-card animate-slide-up bg-gradient-to-br from-card to-muted/30">
      <div className="section-header">
        <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
          <Calculator className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Dnevni sumar</h3>
          <p className="text-sm text-muted-foreground">Automatski izračunato</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Prihodi */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Ukupni prihodi
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-fiscal-light">
              <span className="text-sm font-medium text-fiscal">Fiskalno</span>
              <span className="font-bold text-fiscal">{totals.totalFiscal.toFixed(2)} KM</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-non-fiscal-light">
              <span className="text-sm font-medium text-non-fiscal">Nefiskalno</span>
              <span className="font-bold text-non-fiscal">{totals.totalNonFiscal.toFixed(2)} KM</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-card-payment-light">
              <span className="text-sm font-medium text-card-payment">Kartično</span>
              <span className="font-bold text-card-payment">{totals.totalCardPayments.toFixed(2)} KM</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-wire-transfer-light">
              <span className="text-sm font-medium text-wire-transfer">Žiralno</span>
              <span className="font-bold text-wire-transfer">{totals.totalWireTransfers.toFixed(2)} KM</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg gradient-primary text-primary-foreground">
              <span className="font-semibold">UKUPNO</span>
              <span className="text-xl font-bold">{totals.grandTotal.toFixed(2)} KM</span>
            </div>
          </div>
        </div>

        {/* Broj pregleda */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4" />
            Broj pregleda po doktoru
          </h4>
          <div className="space-y-3">
            {activeDoctors.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">{doc.initials}</span>
                  </div>
                  <span className="font-medium">{doc.firstName}</span>
                </div>
                <span className="text-xl font-bold">{totals.examsByDoctor[doc.id] || 0}</span>
              </div>
            ))}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <span className="font-semibold">Ukupno pregleda</span>
              <span className="text-xl font-bold">
                {Object.values(totals.examsByDoctor).reduce((a, b) => a + b, 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
