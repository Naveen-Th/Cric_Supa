
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface AdminQuickActionProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  onClick: () => void;
}

const AdminQuickAction = ({ 
  icon: Icon, 
  title, 
  description, 
  onClick 
}: AdminQuickActionProps) => {
  return (
    <Button
      variant="outline"
      className="h-auto p-6 flex-col items-center justify-center gap-3 hover:bg-accent transition-colors"
      onClick={onClick}
    >
      <Icon className="h-8 w-8 text-cricket-secondary" />
      <div className="text-center">
        <h3 className="font-medium">{title}</h3>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
    </Button>
  );
};

export default AdminQuickAction;
