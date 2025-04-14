
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Trophy, 
  Users, 
  BarChart2, 
  Calendar,
  Settings,
  LogOut,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

interface NavItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}

const NavItem = ({ to, label, icon, active }: NavItemProps) => (
  <Link to={to}>
    <Button
      variant={active ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start",
        active && "bg-accent text-accent-foreground"
      )}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </Button>
  </Link>
);

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

const Sidebar = ({ open, onClose, isAdmin = false }: SidebarProps) => {
  const location = useLocation();
  const { isAdmin: userIsAdmin, signOut } = useAuth();
  
  // Get current path to highlight active link
  const currentPath = location.pathname;
  
  const userNavItems = [
    { to: '/', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
    { to: '/teams', label: 'Teams', icon: <Users className="h-5 w-5" /> },
    { to: '/matches', label: 'Matches', icon: <Trophy className="h-5 w-5" /> },
    { to: '/statistics', label: 'Statistics', icon: <BarChart2 className="h-5 w-5" /> },
  ];
  
  const adminNavItems = [
    { to: '/admin', label: 'Admin Dashboard', icon: <Shield className="h-5 w-5" /> },
    { to: '/admin/teams', label: 'Manage Teams', icon: <Users className="h-5 w-5" /> },
    { to: '/admin/matches', label: 'Manage Matches', icon: <Trophy className="h-5 w-5" /> },
    { to: '/admin/players', label: 'Manage Players', icon: <Users className="h-5 w-5" /> },
  ];
  
  // If sidebar is closed on mobile, don't render content
  if (!open) {
    return null;
  }
  
  return (
    <>
      {/* Mobile overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden",
          open ? "block" : "hidden"
        )}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 bottom-0 left-0 z-50 w-64 border-r bg-background p-4 transition-transform lg:static lg:z-0",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="h-full flex flex-col justify-between">
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="px-4 text-lg font-semibold">Cricket Hub</h2>
              <p className="px-4 text-sm text-gray-500">Live scores & matches</p>
            </div>
            
            <div className="space-y-1 px-3">
              {userNavItems.map((item) => (
                <NavItem
                  key={item.to}
                  to={item.to}
                  label={item.label}
                  icon={item.icon}
                  active={currentPath === item.to}
                />
              ))}
            </div>
            
            {userIsAdmin && (
              <div className="pt-4">
                <h3 className="px-4 text-sm font-medium mb-2">Admin</h3>
                <div className="space-y-1 px-3">
                  {adminNavItems.map((item) => (
                    <NavItem
                      key={item.to}
                      to={item.to}
                      label={item.label}
                      icon={item.icon}
                      active={currentPath.startsWith(item.to)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="p-3 mt-6">
            <div className="flex flex-col gap-2">
              <Button variant="ghost" className="justify-start">
                <Settings className="h-5 w-5 mr-2" />
                Settings
              </Button>
              <Button 
                variant="ghost" 
                className="justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={signOut}
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
