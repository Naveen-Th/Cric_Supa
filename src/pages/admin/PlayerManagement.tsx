
import { useState } from 'react';
import { useCricket } from '@/context/CricketContext';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Plus, Search, Trash2, UserPlus } from 'lucide-react';
import PlayerForm from '@/components/admin/PlayerForm';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Player } from '@/types/cricket';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const PlayerManagement = () => {
  const { players, teams, addPlayer, updatePlayer, deletePlayer } = useCricket();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [deletingPlayerId, setDeletingPlayerId] = useState<string | null>(null);
  
  const filteredPlayers = players.filter(player => 
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teams.find(t => t.id === player.teamId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeTeamOptions = teams
    .filter(team => team.status === 'active')
    .map(team => ({ id: team.id, name: team.name }));
  
  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setShowEditDialog(true);
  };

  const handleDeletePlayer = (playerId: string) => {
    setDeletingPlayerId(playerId);
    setShowDeleteDialog(true);
  };

  const confirmDeletePlayer = async () => {
    if (deletingPlayerId) {
      try {
        await deletePlayer(deletingPlayerId);
        toast({
          title: "Success",
          description: "Player has been deleted",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete player",
          variant: "destructive",
        });
      }
      setShowDeleteDialog(false);
      setDeletingPlayerId(null);
    }
  };

  const handleAddTeamPlayers = (teamId: string) => {
    navigate(`/admin/teams/${teamId}/add-players`);
  };
  
  return (
    <MainLayout isAdmin>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Player Management</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddDialog(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Player
          </Button>
        </div>
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
                          : player.role === 'Wicket Keeper'
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
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
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditPlayer(player)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeletePlayer(player.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
      
      {/* Add Player Dialog */}
      <PlayerForm 
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSave={addPlayer}
        teamOptions={activeTeamOptions}
        mode="create"
      />
      
      {/* Edit Player Dialog */}
      {editingPlayer && (
        <PlayerForm
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSave={(playerData) => updatePlayer({ ...playerData, id: editingPlayer.id })}
          teamOptions={activeTeamOptions}
          initialData={editingPlayer}
          mode="edit"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete this player and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDeletePlayer}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default PlayerManagement;
