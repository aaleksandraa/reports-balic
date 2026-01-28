import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { bs } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useReport } from '@/contexts/ReportContext';
import { DAYS_OF_WEEK } from '@/types/report';

export function DayTabs() {
  const { currentDate, setCurrentDate } = useReport();
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });

  return (
    <div className="flex gap-1 lg:gap-2 p-1 bg-muted rounded-lg min-w-max">
      {DAYS_OF_WEEK.map((day, index) => {
        const dayDate = addDays(weekStart, index);
        const isActive = isSameDay(dayDate, currentDate);
        const isToday = isSameDay(dayDate, new Date());
        
        return (
          <button
            key={day.key}
            onClick={() => setCurrentDate(dayDate)}
            className={cn(
              'day-tab flex-1 relative min-w-[44px] lg:min-w-[60px] px-2 lg:px-4',
              isActive ? 'day-tab-active' : 'day-tab-inactive'
            )}
          >
            <span className="block text-xs lg:text-sm">{day.short}</span>
            <span className="block text-[10px] lg:text-xs opacity-70">{format(dayDate, 'd')}</span>
            {isToday && !isActive && (
              <span className="absolute bottom-0.5 lg:bottom-1 left-1/2 -translate-x-1/2 w-1 lg:w-1.5 h-1 lg:h-1.5 rounded-full bg-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}
