import { Plus, Trash2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useReport } from '@/contexts/ReportContext';

export function CardPaymentSection() {
  const { doctors, currentReport, addCardPayment, updateCardPayment, deleteCardPayment } = useReport();
  const report = currentReport;
  const activeDoctors = doctors.filter(d => d.role === 'doctor' && d.active);

  const handleAddItem = () => {
    addCardPayment({
      serviceName: '',
      doctorCounts: {},
      price: 0,
    });
  };

  const handleUpdateCount = (itemId: string, doctorId: string, count: number) => {
    const item = report.cardPayments.find(i => i.id === itemId);
    if (item) {
      updateCardPayment(itemId, {
        doctorCounts: { ...item.doctorCounts, [doctorId]: count }
      });
    }
  };

  const totalByDoctor = activeDoctors.reduce((acc, doc) => {
    acc[doc.id] = report.cardPayments.reduce((sum, item) => 
      sum + (item.doctorCounts[doc.id] || 0), 0
    );
    return acc;
  }, {} as Record<string, number>);

  const totalPrice = report.cardPayments.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="section-card animate-slide-up">
      <div className="section-header">
        <div className="w-10 h-10 rounded-lg bg-card-payment-light flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-card-payment" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Kartično plaćanje</h3>
          <p className="text-sm text-muted-foreground">Uplate karticom</p>
        </div>
        <span className="section-badge section-badge-card-payment ml-auto">KARTIČNO</span>
      </div>

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-8">#</th>
              <th className="min-w-[200px]">Usluga</th>
              {activeDoctors.map(doc => (
                <th key={doc.id} className="w-24 text-center">{doc.firstName}</th>
              ))}
              <th className="w-32 text-right">Cijena (KM)</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {report.cardPayments.map((item, index) => (
              <tr key={item.id}>
                <td className="text-muted-foreground">{index + 1}</td>
                <td>
                  <Input
                    value={item.serviceName}
                    onChange={(e) => updateCardPayment(item.id, { serviceName: e.target.value })}
                    placeholder="Naziv usluge..."
                    className="border-0 bg-transparent focus-visible:ring-1"
                  />
                </td>
                {activeDoctors.map(doc => (
                  <td key={doc.id} className="text-center">
                    <Input
                      type="number"
                      min="0"
                      value={item.doctorCounts[doc.id] || ''}
                      onChange={(e) => handleUpdateCount(item.id, doc.id, parseInt(e.target.value) || 0)}
                      className="input-cell"
                    />
                  </td>
                ))}
                <td className="text-right">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price || ''}
                    onChange={(e) => updateCardPayment(item.id, { price: parseFloat(e.target.value) || 0 })}
                    className="input-cell text-right"
                  />
                </td>
                <td>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteCardPayment(item.id)}
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
              {activeDoctors.map(doc => (
                <td key={doc.id} className="text-center font-semibold">
                  {totalByDoctor[doc.id] || 0}
                </td>
              ))}
              <td className="text-right font-semibold">{totalPrice.toFixed(2)}</td>
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
        Dodaj uplatu
      </Button>
    </div>
  );
}
