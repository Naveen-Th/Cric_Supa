
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
import { useState } from 'react';

interface PlayerEditDialogProps {
  player: Player | null;
  teams: { id: string; name: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (player: Player) => void;
}

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
              onValueChange={(value) => setEditingPlayer({ ...editingPlayer, role: value as any })}
            >
              <SelectTrigger id="player-role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Batsman">Batsman</SelectItem>
                <SelectItem value="Bowler">Bowler</SelectItem>
                <SelectItem value="All-Rounder">All-Rounder</SelectItem>
                <SelectItem value="Wicket Keeper">Wicket Keeper</SelectItem>
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
