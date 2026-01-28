import { Menu, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-card border-b z-40 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
          <Stethoscope className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-foreground">IZVJEŠTAJI</span>
      </div>
      <Button variant="ghost" size="icon" onClick={onMenuClick}>
        <Menu className="w-5 h-5" />
      </Button>
    </header>
  );
}
