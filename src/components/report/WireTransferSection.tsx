import { Plus, Trash2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useReport } from '@/contexts/ReportContext';

export function WireTransferSection() {
  const { doctors, currentReport, addWireTransfer, updateWireTransfer, deleteWireTransfer } = useReport();
  const report = currentReport;
  const activeDoctors = doctors.filter(d => d.role === 'doctor' && d.active);

  const handleAddItem = () => {
    addWireTransfer({
      patientName: '',
      doctorCounts: {},
      price: 0,
    });
  };

  const handleUpdateCount = (itemId: string, doctorId: string, count: number) => {
    const item = report.wireTransfers.find(i => i.id === itemId);
    if (item) {
      updateWireTransfer(itemId, {
        doctorCounts: { ...item.doctorCounts, [doctorId]: count }
      });
    }
  };

  const totalByDoctor = activeDoctors.reduce((acc, doc) => {
    acc[doc.id] = report.wireTransfers.reduce((sum, item) => 
      sum + (item.doctorCounts[doc.id] || 0), 0
    );
    return acc;
  }, {} as Record<string, number>);

  const totalPrice = report.wireTransfers.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="section-card animate-slide-up">
      <div className="section-header">
        <div className="w-10 h-10 rounded-lg bg-wire-transfer-light flex items-center justify-center">
          <Building2 className="w-5 h-5 text-wire-transfer" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Žiralne uplate</h3>
          <p className="text-sm text-muted-foreground">Uplate preko računa</p>
        </div>
        <span className="section-badge section-badge-wire-transfer ml-auto">ŽIRALNO</span>
      </div>

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-8">#</th>
              <th className="min-w-[200px]">Ime i prezime pacijenta</th>
              {activeDoctors.map(doc => (
                <th key={doc.id} className="w-24 text-center">{doc.firstName}</th>
              ))}
              <th className="w-32 text-right">Cijena (KM)</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {report.wireTransfers.map((item, index) => (
              <tr key={item.id}>
                <td className="text-muted-foreground">{index + 1}</td>
                <td>
                  <Input
                    value={item.patientName}
                    onChange={(e) => updateWireTransfer(item.id, { patientName: e.target.value })}
                    placeholder="Ime i prezime..."
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
                    onChange={(e) => updateWireTransfer(item.id, { price: parseFloat(e.target.value) || 0 })}
                    className="input-cell text-right"
                  />
                </td>
                <td>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteWireTransfer(item.id)}
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
