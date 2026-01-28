import { Plus, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useReport } from '@/contexts/ReportContext';
import { ServiceCombobox } from './ServiceCombobox';

export function AssociatesSection() {
  const { doctors, currentReport, addAssociate, updateAssociate, deleteAssociate } = useReport();
  const report = currentReport;
  const associates = doctors.filter(d => d.role === 'associate' && d.active);

  const handleAddItem = (type: 'fiscal' | 'non-fiscal') => {
    addAssociate({
      serviceName: '',
      doctorId: associates[0]?.id || '',
      count: 1,
      price: 0,
      type,
    });
  };

  const handleServiceSelect = (itemId: string, serviceName: string, basePrice: number) => {
    const item = report.associates.find(i => i.id === itemId);
    if (item) {
      const totalPrice = basePrice * item.count;
      updateAssociate(itemId, { 
        serviceName,
        price: totalPrice,
      });
      (item as any).basePrice = basePrice;
    }
  };

  const handleCountChange = (itemId: string, count: number) => {
    const item = report.associates.find(i => i.id === itemId);
    if (item) {
      const basePrice = (item as any).basePrice || (item.count > 0 ? item.price / item.count : item.price);
      const newPrice = count > 0 ? basePrice * count : 0;
      
      updateAssociate(itemId, {
        count,
        price: newPrice
      });
      
      (item as any).basePrice = basePrice;
    }
  };

  const fiscalItems = report.associates.filter(a => a.type === 'fiscal');
  const nonFiscalItems = report.associates.filter(a => a.type === 'non-fiscal');

  const fiscalTotal = fiscalItems.reduce((sum, item) => sum + item.price, 0);
  const nonFiscalTotal = nonFiscalItems.reduce((sum, item) => sum + item.price, 0);

  const renderTable = (items: typeof report.associates, type: 'fiscal' | 'non-fiscal') => (
    <div className="space-y-3">
      <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
        {type === 'fiscal' ? 'Fiskalno' : 'Nefiskalno'}
      </h4>
      <table className="data-table">
        <thead>
          <tr>
            <th className="w-8">#</th>
            <th className="min-w-[180px]">Usluga</th>
            <th className="w-32">Doktor</th>
            <th className="w-24 text-center">Broj</th>
            <th className="w-32 text-right">Cijena (KM)</th>
            <th className="w-12"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.id}>
              <td className="text-muted-foreground">{index + 1}</td>
              <td>
                <ServiceCombobox
                  value={item.serviceName}
                  price={item.price}
                  category={type}
                  onSelect={(serviceName, price) => handleServiceSelect(item.id, serviceName, price)}
                />
              </td>
              <td>
                <Select
                  value={item.doctorId}
                  onValueChange={(value) => updateAssociate(item.id, { doctorId: value })}
                >
                  <SelectTrigger className="border-0 bg-transparent focus:ring-1">
                    <SelectValue placeholder="Doktor" />
                  </SelectTrigger>
                  <SelectContent>
                    {associates.map(doc => (
                      <SelectItem key={doc.id} value={doc.id}>{doc.firstName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </td>
              <td className="text-center">
                <Input
                  type="number"
                  min="1"
                  value={item.count || ''}
                  onChange={(e) => handleCountChange(item.id, parseInt(e.target.value) || 0)}
                  className="input-cell"
                />
              </td>
              <td className="text-right">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.price || ''}
                  onChange={(e) => updateAssociate(item.id, { price: parseFloat(e.target.value) || 0 })}
                  className="input-cell text-right"
                />
              </td>
              <td>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteAssociate(item.id)}
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
            <td className="text-right font-semibold">
              {(type === 'fiscal' ? fiscalTotal : nonFiscalTotal).toFixed(2)}
            </td>
            <td></td>
          </tr>
        </tbody>
      </table>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleAddItem(type)}
      >
        <Plus className="w-4 h-4 mr-2" />
        Dodaj
      </Button>
    </div>
  );

  return (
    <div className="section-card animate-slide-up">
      <div className="section-header">
        <div className="w-10 h-10 rounded-lg bg-associates-light flex items-center justify-center">
          <Users className="w-5 h-5 text-associates" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Saradnici</h3>
          <p className="text-sm text-muted-foreground">Usluge saradnika</p>
        </div>
        <span className="section-badge section-badge-associates ml-auto">SARADNICI</span>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {renderTable(fiscalItems, 'fiscal')}
        {renderTable(nonFiscalItems, 'non-fiscal')}
      </div>
    </div>
  );
}
