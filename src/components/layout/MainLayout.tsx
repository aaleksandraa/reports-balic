import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useLocations } from '@/hooks/useLocations';
import { Sheet, SheetContent } from '@/components/ui/sheet';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, profile, isAdmin, signOut } = useAuth();
  const { locations } = useLocations();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <MobileHeader onMenuClick={() => setMobileMenuOpen(true)} />
      
      {/* Mobile Sidebar Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-[280px]">
          <Sidebar 
            user={user}
            profile={profile}
            isAdmin={isAdmin}
            locations={locations}
            onSignOut={signOut}
            isMobile
            onClose={() => setMobileMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 h-full w-64 z-50">
        <Sidebar 
          user={user}
          profile={profile}
          isAdmin={isAdmin}
          locations={locations}
          onSignOut={signOut}
        />
      </aside>
      
      {/* Main Content */}
      <main className="pt-14 lg:pt-0 lg:ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
