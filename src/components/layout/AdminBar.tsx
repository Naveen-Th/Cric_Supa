
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const AdminBar = () => {
  const { signOut, isAdmin } = useAuth();
  
  if (!isAdmin) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button 
        variant="destructive" 
        size="sm" 
        className="shadow-lg flex items-center gap-2"
        onClick={signOut}
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </div>
  );
};

export default AdminBar;
