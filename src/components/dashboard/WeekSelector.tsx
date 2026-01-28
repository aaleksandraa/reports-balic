import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { bs } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { useReport } from '@/contexts/ReportContext';

export function WeekSelector() {
  const { currentDate, setCurrentDate } = useReport();
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  const goToPreviousWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };

  const goToNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="flex items-center gap-2 lg:gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="h-8 w-8 lg:h-10 lg:w-10" onClick={goToPreviousWeek}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <div className="flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 bg-card rounded-lg border">
          <Calendar className="w-4 h-4 text-primary hidden sm:block" />
          <span className="font-medium text-sm lg:text-base whitespace-nowrap">
            {format(weekStart, 'd. MMM', { locale: bs })} - {format(weekEnd, 'd. MMM', { locale: bs })}
          </span>
        </div>
        
        <Button variant="outline" size="icon" className="h-8 w-8 lg:h-10 lg:w-10" onClick={goToNextWeek}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      
      <Button variant="secondary" size="sm" onClick={goToToday} className="h-8 lg:h-9">
        Danas
      </Button>
    </div>
  );
}
