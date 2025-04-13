
import { useState } from 'react';
import { useCricket } from '@/context/CricketContext';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AllPlayers = () => {
  const { players, teams, updatePlayer } = useCricket();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  
  const filteredPlayers = players.filter(player => 
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teams.find(t => t.id === player.teamId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleEditPlayer = (player: any) => {
    setEditingPlayer({
      ...player
    });
    setShowEditDialog(true);
  };
  
  const handleSaveEdit = () => {
    if (editingPlayer) {
      updatePlayer(editingPlayer);
      setShowEditDialog(false);
      setEditingPlayer(null);
    }
  };
  
  return (
    <MainLayout isAdmin>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Players</h1>
      </div>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Search players by name or team..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Player List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Batting Stats</TableHead>
                <TableHead>Bowling Stats</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlayers.map(player => (
                <TableRow key={player.id}>
                  <TableCell className="font-medium">{player.name}</TableCell>
                  <TableCell>
                    {teams.find(t => t.id === player.teamId)?.name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        player.role === 'Batsman' 
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : player.role === 'Bowler'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }
                    >
                      {player.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {player.battingStats?.runs || 0} runs ({player.battingStats?.ballsFaced || 0} balls)
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {player.bowlingStats?.wickets || 0} wickets ({player.bowlingStats?.overs || 0} overs)
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditPlayer(player)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              
              {filteredPlayers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No players found matching the search criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Edit Player Dialog */}
      {editingPlayer && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
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
                  onValueChange={(value) => setEditingPlayer({ ...editingPlayer, role: value })}
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
                onClick={() => setShowEditDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </MainLayout>
  );
};

export default AllPlayers;
