
import React from 'react';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCricket } from '@/context/CricketContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MainLayout from '@/components/layout/MainLayout';
import { toast } from '@/components/ui/use-toast';
import { UserPlus, ArrowLeft } from 'lucide-react';

const AddPlayers = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { teams, addPlayer } = useCricket();
  
  const [playerName, setPlayerName] = useState('');
  const [playerRole, setPlayerRole] = useState<string>('Batsman');
  
  const team = teams.find(t => t.id === teamId);
  
  if (!team) {
    return (
      <MainLayout isAdmin>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Team not found</h1>
            <p className="text-gray-500 mt-2">The team you're trying to add players to doesn't exist.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate('/admin/teams')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Teams
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!playerName.trim()) {
      toast({
        title: 'Error',
        description: 'Player name is required.',
        variant: 'destructive',
      });
      return;
    }
    
    // Add both team_id and teamId for compatibility
    addPlayer({
      name: playerName,
      role: playerRole,
      team_id: teamId,
      teamId: teamId, // Add both properties for compatibility
    });
    
    setPlayerName('');
    
    toast({
      title: 'Success',
      description: `${playerName} has been added to ${team.name}.`,
    });
  };
  
  return (
    <MainLayout isAdmin>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Add Players to {team.name}</h1>
          <p className="text-gray-500">Create new players for this team</p>
        </div>
        
        <Button variant="outline" onClick={() => navigate('/admin/teams')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Teams
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Add New Player</CardTitle>
            <CardDescription>Fill in the details to add a new player to the team</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="playerName">Player Name</Label>
                <Input
                  id="playerName"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter player name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="playerRole">Role</Label>
                <Select value={playerRole} onValueChange={setPlayerRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Batsman">Batsman</SelectItem>
                    <SelectItem value="Bowler">Bowler</SelectItem>
                    <SelectItem value="All-Rounder">All-Rounder</SelectItem>
                    <SelectItem value="Wicket Keeper">Wicket Keeper</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Player
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Existing Players ({team.players?.length || 0})</CardTitle>
            <CardDescription>Players currently in {team.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {team.players && team.players.length > 0 ? (
                team.players.map(player => (
                  <div
                    key={player.id}
                    className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md"
                  >
                    <div>
                      <div className="font-medium">{player.name}</div>
                      <div className="text-sm text-gray-500">{player.role}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No players in this team yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AddPlayers;
