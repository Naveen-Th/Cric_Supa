import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCricket } from '@/context/CricketContext';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { 
  PlusCircle, 
  Trash2, 
  ChevronLeft,
  Swords,
  CircleDot,
  Shield,
  UserCircle2
} from 'lucide-react';

const AddPlayers = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { teams, addPlayer, deletePlayer } = useCricket();
  
  const team = teams.find(team => team.id === teamId);
  
  const [playerName, setPlayerName] = useState('');
  const [playerRole, setPlayerRole] = useState<'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicket Keeper'>('Batsman');
  
  if (!team) {
    return (
      <MainLayout isAdmin>
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Team Not Found</h2>
          <p>The team you're looking for doesn't exist or has been removed.</p>
        </div>
      </MainLayout>
    );
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Batsman':
        return <Swords className="h-4 w-4 text-blue-500" />;
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
  
  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!playerName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a player name.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!teamId) return;
    
    addPlayer({
      name: playerName,
      role: playerRole,
      teamId,
    });
    
    setPlayerName('');
    setPlayerRole('Batsman');
  };
  
  const handleFinish = () => {
    if (team.players.length < 10) {
      toast({
        title: 'Warning',
        description: 'A team should have at least 10 players. Please add more players.',
        variant: 'destructive',
      });
      return;
    }
    
    navigate(`/admin/teams`);
  };
  
  return (
    <MainLayout isAdmin>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Add Players to {team.name}</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add New Player</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddPlayer} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="player-name">Player Name</Label>
                  <Input
                    id="player-name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter player name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="player-role">Player Role</Label>
                  <Select 
                    value={playerRole} 
                    onValueChange={(value: 'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicket Keeper') => setPlayerRole(value)}
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
                
                <Button type="submit" className="w-full">Add Player</Button>
              </form>
            </CardContent>
          </Card>
          
          <div className="flex justify-end mt-4">
            <Button 
              onClick={handleFinish}
              disabled={team.players.length < 10}
            >
              Finish ({team.players.length}/10 players)
            </Button>
          </div>
        </div>
        
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Team Roster</CardTitle>
            </CardHeader>
            <CardContent>
              {team.players.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {team.players.map(player => (
                      <TableRow key={player.id}>
                        <TableCell className="font-medium">{player.name}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              `flex items-center gap-1.5 ${
                                player.role === 'Batsman' 
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : player.role === 'Bowler'
                                  ? 'bg-green-50 text-green-700 border-green-200'
                                  : player.role === 'Wicket Keeper'
                                  ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                  : 'bg-purple-50 text-purple-700 border-purple-200'
                              }`
                            }
                          >
                            {getRoleIcon(player.role)}
                            {player.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deletePlayer(player.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center p-8">
                  <p className="text-gray-500">No players added yet. Add at least 10 players to the team.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default AddPlayers;
