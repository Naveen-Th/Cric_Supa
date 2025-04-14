
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCricket } from '@/context/CricketContext';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Trash2, UserMinus, UserPlus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const EditTeam = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { teams, updateTeam, deleteTeam, deletePlayer } = useCricket();
  const navigate = useNavigate();
  
  const team = teams.find(t => t.id === teamId);
  
  const [teamName, setTeamName] = useState('');
  const [teamStatus, setTeamStatus] = useState<'active' | 'inactive'>('active');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRemovePlayerDialog, setShowRemovePlayerDialog] = useState(false);
  const [playerToRemove, setPlayerToRemove] = useState<string | null>(null);
  
  useEffect(() => {
    if (team) {
      setTeamName(team.name);
      setTeamStatus(team.status);
    }
  }, [team]);
  
  if (!team) {
    return (
      <MainLayout isAdmin>
        <div className="text-center p-10">
          <h2 className="text-xl font-semibold mb-2">Team not found</h2>
          <p className="text-gray-500 mb-4">The team you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => navigate('/admin/teams')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Teams
          </Button>
        </div>
      </MainLayout>
    );
  }
  
  const handleSave = async () => {
    if (!teamName.trim()) {
      toast({
        title: "Error",
        description: "Team name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await updateTeam({
        ...team,
        name: teamName,
        status: teamStatus,
      });
      
      toast({
        title: "Success",
        description: "Team updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update team",
        variant: "destructive",
      });
    }
  };
  
  const handleDelete = async () => {
    try {
      await deleteTeam(team.id);
      
      toast({
        title: "Success",
        description: "Team deleted successfully",
      });
      
      navigate('/admin/teams');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete team",
        variant: "destructive",
      });
    }
  };
  
  const handleRemovePlayer = async () => {
    if (!playerToRemove) return;
    
    try {
      await deletePlayer(playerToRemove);
      
      toast({
        title: "Success",
        description: "Player removed successfully",
      });
      
      setShowRemovePlayerDialog(false);
      setPlayerToRemove(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove player",
        variant: "destructive",
      });
    }
  };
  
  return (
    <MainLayout isAdmin>
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/teams')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Edit Team</h1>
        </div>
        
        <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Team
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Team Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="team-name">Team Name</Label>
                  <Input
                    id="team-name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Enter team name"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="team-status">Active Status</Label>
                  <Switch
                    id="team-status"
                    checked={teamStatus === 'active'}
                    onCheckedChange={(checked) => setTeamStatus(checked ? 'active' : 'inactive')}
                  />
                </div>
                
                <Button className="w-full" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Players</CardTitle>
              <Button 
                size="sm"
                onClick={() => navigate(`/admin/teams/${team.id}/add-players`)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Players
              </Button>
            </CardHeader>
            <CardContent>
              {team.players.length > 0 ? (
                <div className="space-y-2">
                  {team.players.map((player) => (
                    <div 
                      key={player.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
                    >
                      <div>
                        <span className="font-medium">{player.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {player.role}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPlayerToRemove(player.id);
                          setShowRemovePlayerDialog(true);
                        }}
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No players in this team yet.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => navigate(`/admin/teams/${team.id}/add-players`)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Players
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Delete Team Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{team.name}"? This action cannot be undone
              and will also remove all players associated with this team.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Remove Player Dialog */}
      <Dialog open={showRemovePlayerDialog} onOpenChange={setShowRemovePlayerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Player</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this player from the team? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRemovePlayerDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemovePlayer}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default EditTeam;
