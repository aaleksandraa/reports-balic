import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut,
  Stethoscope,
  Building,
  Receipt,
  UsersRound,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  user: { email?: string } | null;
  profile: { first_name?: string | null } | null;
  isAdmin: boolean;
  locations: Array<{ id: string; name: string; active: boolean }>;
  onSignOut: () => void;
  isMobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ user, profile, isAdmin, locations, onSignOut, isMobile, onClose }: SidebarProps) {
  const routeLocation = useLocation();

  const activeLocations = locations.filter(l => l.active);

  const handleNavClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <aside className={cn(
      "h-full bg-card flex flex-col",
      isMobile ? "w-full" : "w-64 border-r"
    )}>
      {/* Logo */}
      <div className="p-4 lg:p-6 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground">IZVJEŠTAJI</h1>
            <p className="text-xs text-muted-foreground">Report System</p>
          </div>
        </div>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 lg:p-4 space-y-1 overflow-y-auto">
        {/* Locations Section */}
        {activeLocations.length > 0 && (
          <>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 py-2">
              Lokacije
            </p>
            {activeLocations.map((loc) => {
              const isLocationActive = routeLocation.pathname.startsWith(`/location/${loc.id}`);
              return (
                <NavLink
                  key={loc.id}
                  to={`/location/${loc.id}`}
                  onClick={handleNavClick}
                  className={cn(
                    'nav-item',
                    isLocationActive && 'nav-item-active'
                  )}
                >
                  <Building className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium truncate">{loc.name}</span>
                </NavLink>
              );
            })}
          </>
        )}

        {activeLocations.length === 0 && (
          <NavLink
            to="/"
            onClick={handleNavClick}
            className={cn(
              'nav-item',
              routeLocation.pathname === '/' && 'nav-item-active'
            )}
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Dashboard</span>
          </NavLink>
        )}

        {isAdmin && (
          <div className="pt-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 py-2">
              Administracija
            </p>
            <NavLink
              to="/reports"
              onClick={handleNavClick}
              className={cn(
                'nav-item',
                routeLocation.pathname === '/reports' && 'nav-item-active'
              )}
            >
              <Receipt className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">Napredni filtri</span>
            </NavLink>
            <NavLink
              to="/locations"
              onClick={handleNavClick}
              className={cn(
                'nav-item',
                routeLocation.pathname === '/locations' && 'nav-item-active'
              )}
            >
              <Building className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">Lokacije</span>
            </NavLink>
            <NavLink
              to="/services"
              onClick={handleNavClick}
              className={cn(
                'nav-item',
                routeLocation.pathname === '/services' && 'nav-item-active'
              )}
            >
              <Receipt className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">Usluge - Cjenovnik</span>
            </NavLink>
            <NavLink
              to="/doctors"
              onClick={handleNavClick}
              className={cn(
                'nav-item',
                routeLocation.pathname === '/doctors' && 'nav-item-active'
              )}
            >
              <Users className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">Doktori</span>
            </NavLink>
            <NavLink
              to="/staff"
              onClick={handleNavClick}
              className={cn(
                'nav-item',
                routeLocation.pathname === '/staff' && 'nav-item-active'
              )}
            >
              <UsersRound className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">Osoblje sistema</span>
            </NavLink>
            <NavLink
              to="/employees"
              onClick={handleNavClick}
              className={cn(
                'nav-item',
                routeLocation.pathname === '/employees' && 'nav-item-active'
              )}
            >
              <Users className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">Radnici</span>
            </NavLink>
            <NavLink
              to="/settings"
              onClick={handleNavClick}
              className={cn(
                'nav-item',
                routeLocation.pathname === '/settings' && 'nav-item-active'
              )}
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">Postavke</span>
            </NavLink>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-3 lg:p-4 border-t">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 mb-2">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-primary">
              {profile?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {profile?.first_name || user?.email?.split('@')[0]}
            </p>
            <p className="text-xs text-muted-foreground">
              {isAdmin ? 'Administrator' : 'Osoblje'}
            </p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start text-muted-foreground"
          onClick={() => {
            onSignOut();
            if (isMobile && onClose) onClose();
          }}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Odjava
        </Button>
      </div>
    </aside>
  );
}
