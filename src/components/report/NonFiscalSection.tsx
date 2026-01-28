import { Plus, Trash2, FileX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useReport } from '@/contexts/ReportContext';
import { ServiceCombobox } from './ServiceCombobox';

export function NonFiscalSection() {
  const { doctors, currentReport, addNonFiscalItem, updateNonFiscalItem, deleteNonFiscalItem } = useReport();
  const report = currentReport;
  const activeDoctors = doctors.filter(d => d.role === 'doctor' && d.active);

  const handleAddItem = () => {
    addNonFiscalItem({
      serviceName: '',
      doctorCounts: {},
      price: 0,
    });
  };

  const handleServiceSelect = (itemId: string, serviceName: string, basePrice: number) => {
    const item = report.nonFiscalItems.find(i => i.id === itemId);
    if (item) {
      const totalCount = Object.values(item.doctorCounts).reduce((sum, count) => sum + count, 0);
      const totalPrice = totalCount > 0 ? basePrice * totalCount : basePrice;
      
      updateNonFiscalItem(itemId, { 
        serviceName,
        price: totalPrice,
      });
      
      (item as any).basePrice = basePrice;
    }
  };

  const handleUpdateCount = (itemId: string, doctorId: string, count: number) => {
    const item = report.nonFiscalItems.find(i => i.id === itemId);
    if (item) {
      const newDoctorCounts = { ...item.doctorCounts, [doctorId]: count };
      const totalCount = Object.values(newDoctorCounts).reduce((sum, c) => sum + c, 0);
      
      const oldTotalCount = Object.values(item.doctorCounts).reduce((sum, c) => sum + c, 0);
      const basePrice = (item as any).basePrice || (oldTotalCount > 0 ? item.price / oldTotalCount : item.price);
      const newPrice = totalCount > 0 ? basePrice * totalCount : 0;
      
      updateNonFiscalItem(itemId, {
        doctorCounts: newDoctorCounts,
        price: newPrice
      });
      
      (item as any).basePrice = basePrice;
    }
  };

  const totalByDoctor = activeDoctors.reduce((acc, doc) => {
    acc[doc.id] = report.nonFiscalItems.reduce((sum, item) => 
      sum + (item.doctorCounts[doc.id] || 0), 0
    );
    return acc;
  }, {} as Record<string, number>);

  const totalPrice = report.nonFiscalItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="section-card animate-slide-up">
      <div className="section-header">
        <div className="w-10 h-10 rounded-lg bg-non-fiscal-light flex items-center justify-center">
          <FileX className="w-5 h-5 text-non-fiscal" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Nefiskalno</h3>
          <p className="text-sm text-muted-foreground">Nefiskalizovane usluge</p>
        </div>
        <span className="section-badge section-badge-non-fiscal ml-auto">NEFISKALNO</span>
      </div>

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-8">#</th>
              <th className="min-w-[200px]">Naziv usluge</th>
              {activeDoctors.map(doc => (
                <th key={doc.id} className="w-24 text-center">{doc.firstName}</th>
              ))}
              <th className="w-32 text-right">Cijena (KM)</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {report.nonFiscalItems.map((item, index) => (
              <tr key={item.id}>
                <td className="text-muted-foreground">{index + 1}</td>
                <td>
                  <ServiceCombobox
                    value={item.serviceName}
                    price={item.price}
                    category="non-fiscal"
                    onSelect={(serviceName, price) => handleServiceSelect(item.id, serviceName, price)}
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
                    onChange={(e) => updateNonFiscalItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                    className="input-cell text-right"
                  />
                </td>
                <td>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteNonFiscalItem(item.id)}
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
        Dodaj uslugu
      </Button>
    </div>
  );
}
