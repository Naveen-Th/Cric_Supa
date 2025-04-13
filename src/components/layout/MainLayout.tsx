
import { ReactNode } from 'react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger 
} from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';

interface MainLayoutProps {
  children: ReactNode;
  isAdmin?: boolean;
}

const MainLayout = ({ children, isAdmin = false }: MainLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar isAdmin={isAdmin} />
        <main className="flex-grow">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex items-center mb-6">
              <SidebarTrigger className="mr-4" />
              <h1 className="text-2xl font-bold">
                {isAdmin ? "Admin Dashboard" : "Cricket Hub"}
              </h1>
            </div>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
