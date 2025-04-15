import { Player } from '@/types/cricket';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bath, CircleDot, Shield, UserCircle2 } from 'lucide-react';
import { useState } from 'react';

interface PlayerEditDialogProps {
  player: Player | null;
  teams: { id: string; name: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (player: Player) => void;
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'Batsman':
      return <Bath className="h-4 w-4 text-blue-500" />;
    case 'Bowler':
      return <CircleDot className="h-4 w-4 text-green-500" />;
    case 'All-Rounder':
      return <Shield className="h-4 w-4 text-purple-500" />;
    case 'Wicket Keeper':
      return <UserCircle2 className="h-4 w-4 text-yellow-500" />;
    default:
      return null;
  }
};

const PlayerEditDialog = ({ 
  player, 
  teams, 
  open, 
  onOpenChange, 
  onSave 
}: PlayerEditDialogProps) => {
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(player);

  // Update local state when the player prop changes
  if (player && (!editingPlayer || player.id !== editingPlayer.id)) {
    setEditingPlayer(player);
  }

  const handleSave = () => {
    if (editingPlayer) {
      onSave(editingPlayer);
    }
  };

  if (!editingPlayer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Player</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="player-name">Name</Label>
            <Input
              id="player-name"
              value={editingPlayer.name}
              onChange={(e) => setEditingPlayer({ ...editingPlayer, name: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="player-role">Role</Label>
            <Select 
              value={editingPlayer.role} 
              onValueChange={(value: 'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicket Keeper') => 
                setEditingPlayer({ ...editingPlayer, role: value })}
            >
              <SelectTrigger id="player-role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Batsman">
                  <div className="flex items-center gap-2">
                    <Bath className="h-4 w-4 text-blue-500" />
                    <span>Batsman</span>
                  </div>
                </SelectItem>
                <SelectItem value="Bowler">
                  <div className="flex items-center gap-2">
                    <CircleDot className="h-4 w-4 text-green-500" />
                    <span>Bowler</span>
                  </div>
                </SelectItem>
                <SelectItem value="All-Rounder">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-500" />
                    <span>All-Rounder</span>
                  </div>
                </SelectItem>
                <SelectItem value="Wicket Keeper">
                  <div className="flex items-center gap-2">
                    <UserCircle2 className="h-4 w-4 text-yellow-500" />
                    <span>Wicket Keeper</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="player-team">Team</Label>
            <Select 
              value={editingPlayer.teamId} 
              onValueChange={(value) => setEditingPlayer({ ...editingPlayer, teamId: value })}
            >
              <SelectTrigger id="player-team">
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map(team => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerEditDialog;
