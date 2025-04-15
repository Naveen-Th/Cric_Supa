import { useState, useEffect } from 'react';
import { useCricket } from '@/context/CricketContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronLeft, ChevronRight, UserMinus, UserPlus, Users, Sword, CircleDot, Shield, UserCircle2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Player, Team } from '@/types/cricket';

interface PlayerTeamAssignmentProps {
  teamId: string;
  onBack?: () => void;
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'Batsman':
      return <Sword className="h-4 w-4 text-blue-500" />;
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

const PlayerTeamAssignment = ({ teamId, onBack }: PlayerTeamAssignmentProps) => {
  const { teams, players, updatePlayer } = useCricket();
  const [sourceTeamId, setSourceTeamId] = useState<string>('');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  
  // Get the target team
  const targetTeam = teams.find(team => team.id === teamId);
  
  // Filter out teams that aren't the target team for source selection
  const sourceTeamOptions = teams
    .filter(team => team.id !== teamId && team.status === 'active')
    .map(team => ({ id: team.id, name: team.name }));
  
  // Get players from the selected source team
  const sourcePlayers = players.filter(player => player.teamId === sourceTeamId);
  
  // Get players from the target team
  const targetPlayers = players.filter(player => player.teamId === teamId);
  
  // Set first available source team on load if none selected
  useEffect(() => {
    if (sourceTeamOptions.length > 0 && !sourceTeamId) {
      setSourceTeamId(sourceTeamOptions[0].id);
    }
  }, [sourceTeamOptions, sourceTeamId]);
  
  // Add selected players to target team
  const handleAddToTeam = async () => {
    if (selectedPlayers.length === 0) {
      toast({
        title: 'No players selected',
        description: 'Please select players to add to the team',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Update each selected player
      for (const playerId of selectedPlayers) {
        const player = players.find(p => p.id === playerId);
        if (player) {
          await updatePlayer({
            ...player,
            teamId,
          });
        }
      }
      
      // Clear selection
      setSelectedPlayers([]);
      
      toast({
        title: 'Success',
        description: `${selectedPlayers.length} player(s) added to ${targetTeam?.name}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add players to team',
        variant: 'destructive',
      });
    }
  };
  
  // Toggle player selection
  const togglePlayerSelection = (playerId: string) => {
    setSelectedPlayers(prev => 
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };
  
  // Remove a player from the team
  const handleRemoveFromTeam = async (player: Player) => {
    if (!sourceTeamId) {
      toast({
        title: 'No destination team selected',
        description: 'Please select a team to move the player to',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await updatePlayer({
        ...player,
        teamId: sourceTeamId,
      });
      
      toast({
        title: 'Success',
        description: `${player.name} removed from ${targetTeam?.name}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove player from team',
        variant: 'destructive',
      });
    }
  };
  
  if (!targetTeam) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Team not found</div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {onBack && (
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Manage Teams
        </Button>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source Team */}
        <Card>
          <CardHeader>
            <CardTitle>Available Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="source-team">Select Source Team</Label>
                <Select 
                  value={sourceTeamId} 
                  onValueChange={setSourceTeamId}
                >
                  <SelectTrigger id="source-team">
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceTeamOptions.map(team => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="border rounded-md overflow-hidden">
                <div className="p-3 bg-gray-50 border-b">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Player List</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={selectedPlayers.length === 0}
                      onClick={handleAddToTeam}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Selected ({selectedPlayers.length})
                    </Button>
                  </div>
                </div>
                
                <div className="max-h-[400px] overflow-y-auto">
                  {sourcePlayers.length > 0 ? (
                    <ul className="divide-y">
                      {sourcePlayers.map(player => (
                        <li 
                          key={player.id} 
                          className={`p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50 ${
                            selectedPlayers.includes(player.id) ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => togglePlayerSelection(player.id)}
                        >
                          <div>
                            <div className="font-medium">{player.name}</div>
                            <Badge
                              variant="outline"
                              className="mt-1 flex items-center gap-1.5"
                            >
                              {getRoleIcon(player.role)}
                              {player.role}
                            </Badge>
                          </div>
                          {selectedPlayers.includes(player.id) && (
                            <Check className="h-5 w-5 text-green-500" />
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No players available in this team
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Target Team */}
        <Card>
          <CardHeader>
            <CardTitle>Current Players in {targetTeam.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md overflow-hidden">
              <div className="p-3 bg-gray-50 border-b">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Team Roster</span>
                  <span className="text-sm text-gray-500">
                    {targetPlayers.length} players
                  </span>
                </div>
              </div>
              
              <div className="max-h-[400px] overflow-y-auto">
                {targetPlayers.length > 0 ? (
                  <ul className="divide-y">
                    {targetPlayers.map(player => (
                      <li 
                        key={player.id} 
                        className="p-3 flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium">{player.name}</div>
                          <Badge
                            variant="outline"
                            className="mt-1 flex items-center gap-1.5"
                          >
                            {getRoleIcon(player.role)}
                            {player.role}
                          </Badge>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromTeam(player);
                          }}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No players in this team yet
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlayerTeamAssignment;
