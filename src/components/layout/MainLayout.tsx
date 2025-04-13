import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import AdminBar from './AdminBar';

interface MainLayoutProps {
  children: React.ReactNode;
  isAdmin?: boolean;
}

const MainLayout = ({ children, isAdmin = false }: MainLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-screen bg-background">
      {isMobile ? (
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} isAdmin={isAdmin} />
      ) : (
        <Sidebar open={true} onClose={() => {}} isAdmin={isAdmin} />
      )}
      <div className="flex flex-col min-h-screen w-full">
        <header className="sticky top-0 z-10 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="mr-2 lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            )}
            <h1 className="text-xl font-semibold">
              {isAdmin ? "Cricket Admin" : "Cricket Score"}
            </h1>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
      
      <AdminBar />
    </div>
  );
};

export default MainLayout;
