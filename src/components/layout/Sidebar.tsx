
import React from 'react';
import { 
  Sidebar as ShadcnSidebar, 
  SidebarContent, 
  SidebarProvider 
} from '@/components/ui/sidebar';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, isAdmin = false }) => {
  return (
    <SidebarProvider>
      <ShadcnSidebar>
        <SidebarContent>
          {/* Add sidebar content based on user role */}
          {isAdmin ? (
            <div>Admin Sidebar Content</div>
          ) : (
            <div>User Sidebar Content</div>
          )}
        </SidebarContent>
      </ShadcnSidebar>
    </SidebarProvider>
  );
};

export default Sidebar;
