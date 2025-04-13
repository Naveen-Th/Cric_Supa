
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, Trophy, Shield, Settings, BarChart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

interface AppSidebarProps {
  isAdmin?: boolean;
}

const AppSidebar = ({ isAdmin = false }: AppSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  
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
    <Sidebar>
      <SidebarHeader className="pb-2">
        <div className="flex items-center justify-center p-4">
          <div className="w-10 h-10 bg-cricket-pitch rounded-full flex items-center justify-center">
            <span className="text-white font-bold">CH</span>
          </div>
          <span className="ml-2 font-bold text-white text-lg">Cricket Hub</span>
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
      </SidebarContent>
      
      <SidebarFooter>
        <div className="p-4">
          {isAdmin ? (
            <Button 
              variant="outline" 
              size="sm"
              className="w-full"
              onClick={() => navigate('/')}
            >
              View User Dashboard
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              className="w-full"
              onClick={() => navigate('/admin')}
            >
              Admin Access
            </Button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
