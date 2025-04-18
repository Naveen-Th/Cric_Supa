
import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCricket } from '@/context/CricketContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/components/ui/use-toast';
import MainLayout from '@/components/layout/MainLayout';
import { Team } from '@/types/cricket';

const EditTeam = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { teams, updateTeam } = useCricket();
  
  const [team, setTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState('');
  const [teamStatus, setTeamStatus] = useState<'active' | 'inactive'>('active');
  
  useEffect(() => {
    const foundTeam = teams.find(t => t.id === id);
    if (foundTeam) {
      setTeam(foundTeam);
    } else {
      toast({
        title: 'Team not found',
        description: 'The team you are trying to edit does not exist.',
        variant: 'destructive',
      });
      navigate('/admin/teams');
    }
  }, [id, teams, navigate]);
  
  useEffect(() => {
    if (team) {
      setTeamName(team.name);
      setTeamStatus(team.status as 'active' | 'inactive');
    }
  }, [team]);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!team) return;
    
    try {
      await updateTeam({
        ...team,
        name: teamName,
        status: teamStatus,
      });
      
      toast({
        title: 'Team updated',
        description: 'The team has been updated successfully.',
      });
      
      navigate('/admin/teams');
    } catch (error) {
      console.error('Error updating team:', error);
      toast({
        title: 'Error',
        description: 'Failed to update team.',
        variant: 'destructive',
      });
    }
  };
  
  if (!team) {
    return (
      <MainLayout isAdmin>
        <div className="flex items-center justify-center h-96">
          <p>Loading...</p>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout isAdmin>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Team</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Update Team Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Team Name</Label>
              <Input
                id="name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter team name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <RadioGroup
                value={teamStatus}
                onValueChange={(value) => setTeamStatus(value as 'active' | 'inactive')}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="active" />
                  <Label htmlFor="active">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inactive" id="inactive" />
                  <Label htmlFor="inactive">Inactive</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="flex space-x-4">
              <Button type="submit">Update Team</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/teams')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default EditTeam;
