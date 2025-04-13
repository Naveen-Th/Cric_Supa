
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Sidebar as ShadcnSidebar, 
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { 
  Home, 
  Users, 
  Trophy, 
  Shield, 
  BarChart, 
  Settings,
  LogOut, 
  ChevronLeft
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, isAdmin = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  
  // Close sidebar on navigation on mobile
  useEffect(() => {
    if (open) {
      const handleRouteChange = () => {
        onClose();
      };
      
      window.addEventListener('popstate', handleRouteChange);
      
      return () => {
        window.removeEventListener('popstate', handleRouteChange);
      };
    }
  }, [open, onClose]);
  
  // User navigation items
  const userItems = [
    {
      title: 'Dashboard',
      icon: Home,
      path: '/',
    },
    {
      title: 'Teams',
      icon: Users,
      path: '/teams',
    },
    {
      title: 'Matches',
      icon: Trophy,
      path: '/matches',
    },
    {
      title: 'Statistics',
      icon: BarChart,
      path: '/statistics',
    }
  ];
  
  // Admin navigation items
  const adminItems = [
    {
      title: 'Admin Dashboard',
      icon: Shield,
      path: '/admin',
    },
    {
      title: 'Manage Teams',
      icon: Users,
      path: '/admin/teams',
    },
    {
      title: 'Manage Matches',
      icon: Trophy,
      path: '/admin/matches',
    },
    {
      title: 'All Players',
      icon: Users,
      path: '/admin/players',
    },
  ];
  
  const items = isAdmin ? adminItems : userItems;

  return (
    <SidebarProvider defaultOpen={open}>
      <ShadcnSidebar>
        <SidebarHeader className="pb-2">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold">CH</span>
              </div>
              <span className="ml-2 font-bold text-lg">Cricket Hub</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="md:hidden"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>
              {isAdmin ? 'Admin Controls' : 'Navigation'}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={location.pathname === item.path}
                      onClick={() => navigate(item.path)}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          
          {isAdmin && (
            <SidebarGroup>
              <SidebarGroupLabel>User View</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate('/')}>
                      <Home className="h-5 w-5" />
                      <span>Go to User Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
          
          {!isAdmin && (
            <SidebarGroup>
              <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate('/matches/live')}>
                      <Trophy className="h-5 w-5" />
                      <span>View Live Matches</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>
        
        <SidebarFooter>
          <div className="p-4 flex flex-col gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="w-full justify-start"
              onClick={() => navigate('/settings')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="w-full justify-start"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
            
            {!isAdmin && (
              <Button 
                variant="default" 
                size="sm"
                className="w-full mt-2"
                onClick={() => navigate('/admin')}
              >
                <Shield className="h-4 w-4 mr-2" />
                Admin Access
              </Button>
            )}
          </div>
        </SidebarFooter>
      </ShadcnSidebar>
    </SidebarProvider>
  );
};

export default Sidebar;
