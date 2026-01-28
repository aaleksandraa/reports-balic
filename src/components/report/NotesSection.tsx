import { MessageSquare } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useReport } from '@/contexts/ReportContext';

export function NotesSection() {
  const { currentReport, updateCurrentReport, currentUserName } = useReport();
  const report = currentReport;

  return (
    <div className="section-card animate-slide-up">
      <div className="section-header">
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Napomena</h3>
          <p className="text-sm text-muted-foreground">Dodatne informacije i obrazloženja</p>
        </div>
      </div>

      <div className="space-y-4">
        <Textarea
          value={report.notes}
          onChange={(e) => updateCurrentReport({ notes: e.target.value })}
          placeholder="Unesite napomenu... (npr. izdati lijekovi, dugovanja, posebne napomene)"
          className="min-h-[120px] resize-none"
        />

        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Podnosilac izvještaja
            </label>
            <div className="px-3 py-2 rounded-md border bg-muted/50 text-foreground">
              {currentUserName || report.submittedByName || 'Nije postavljen'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
