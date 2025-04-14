
import { useState } from 'react';
import { Player } from '@/types/cricket';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

interface PlayerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (player: Omit<Player, 'id'>) => void;
  teamOptions: { id: string; name: string }[];
  initialData?: Player;
  mode: 'create' | 'edit';
}

const PlayerForm = ({ 
  open, 
  onOpenChange, 
  onSave, 
  teamOptions, 
  initialData,
  mode = 'create'
}: PlayerFormProps) => {
  const [playerData, setPlayerData] = useState<Omit<Player, 'id'>>({
    name: initialData?.name || '',
    role: initialData?.role || 'Batsman',
    teamId: initialData?.teamId || (teamOptions[0]?.id || ''),
    battingStats: initialData?.battingStats || { runs: 0, ballsFaced: 0, fours: 0, sixes: 0 },
    bowlingStats: initialData?.bowlingStats || { overs: 0, maidens: 0, runs: 0, wickets: 0 },
  });

  const handleSave = () => {
    if (!playerData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Player name is required',
        variant: 'destructive',
      });
      return;
    }

    if (!playerData.teamId) {
      toast({
        title: 'Error',
        description: 'Please select a team',
        variant: 'destructive',
      });
      return;
    }

    onSave(playerData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add New Player' : 'Edit Player'}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="player-name">Player Name</Label>
            <Input
              id="player-name"
              value={playerData.name}
              onChange={(e) => setPlayerData({ ...playerData, name: e.target.value })}
              placeholder="Enter player name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="player-role">Player Role</Label>
            <Select 
              value={playerData.role} 
              onValueChange={(value) => setPlayerData({ ...playerData, role: value as any })}
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
              value={playerData.teamId} 
              onValueChange={(value) => setPlayerData({ ...playerData, teamId: value })}
            >
              <SelectTrigger id="player-team">
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {teamOptions.map(team => (
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
          <Button onClick={handleSave}>
            {mode === 'create' ? 'Add Player' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerForm;
