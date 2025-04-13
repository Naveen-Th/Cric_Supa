
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCricket } from '@/context/CricketContext';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

const CreateMatch = () => {
  const { teams, createMatch } = useCricket();
  const navigate = useNavigate();
  
  const [team1Id, setTeam1Id] = useState('');
  const [team2Id, setTeam2Id] = useState('');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [totalOvers, setTotalOvers] = useState('');
  const [tossWinnerId, setTossWinnerId] = useState('');
  const [tossChoice, setTossChoice] = useState<'bat' | 'bowl' | ''>('');
  
  const activeTeams = teams.filter(team => team.status === 'active');
  
  const handleCreateMatch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!team1Id || !team2Id || !date || !venue || !totalOvers) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    if (team1Id === team2Id) {
      toast({
        title: 'Error',
        description: 'Please select different teams for the match.',
        variant: 'destructive',
      });
      return;
    }
    
    if (isNaN(Number(totalOvers)) || Number(totalOvers) <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid number of overs.',
        variant: 'destructive',
      });
      return;
    }
    
    // Create the match
    createMatch({
      team1Id,
      team2Id,
      date,
      venue,
      status: 'upcoming',
      totalOvers: Number(totalOvers),
      currentInnings: 1,
      ...(tossWinnerId && tossChoice ? { tossWinnerId, tossChoice } : {}),
    });
    
    // Redirect to the matches page
    navigate('/admin/matches');
  };
  
  return (
    <MainLayout isAdmin>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create New Match</h1>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Match Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateMatch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="team1">Team 1</Label>
                <Select value={team1Id} onValueChange={setTeam1Id}>
                  <SelectTrigger id="team1">
                    <SelectValue placeholder="Select team 1" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeTeams.map(team => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="team2">Team 2</Label>
                <Select value={team2Id} onValueChange={setTeam2Id}>
                  <SelectTrigger id="team2">
                    <SelectValue placeholder="Select team 2" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeTeams
                      .filter(team => team.id !== team1Id)
                      .map(team => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Match Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="venue">Venue</Label>
                <Input
                  id="venue"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Enter match venue"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="overs">Total Overs</Label>
                <Input
                  id="overs"
                  type="number"
                  value={totalOvers}
                  onChange={(e) => setTotalOvers(e.target.value)}
                  placeholder="Enter number of overs"
                  min="1"
                />
              </div>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium mb-2">Toss Details (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="toss-winner">Toss Winner</Label>
                  <Select value={tossWinnerId} onValueChange={setTossWinnerId}>
                    <SelectTrigger id="toss-winner">
                      <SelectValue placeholder="Select toss winner" />
                    </SelectTrigger>
                    <SelectContent>
                      {team1Id && (
                        <SelectItem value={team1Id}>
                          {teams.find(t => t.id === team1Id)?.name}
                        </SelectItem>
                      )}
                      {team2Id && (
                        <SelectItem value={team2Id}>
                          {teams.find(t => t.id === team2Id)?.name}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="toss-choice">Toss Choice</Label>
                  <Select 
                    value={tossChoice} 
                    onValueChange={(value) => setTossChoice(value as 'bat' | 'bowl')}
                    disabled={!tossWinnerId}
                  >
                    <SelectTrigger id="toss-choice">
                      <SelectValue placeholder="Select choice" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bat">Bat</SelectItem>
                      <SelectItem value="bowl">Bowl</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/matches')}
              >
                Cancel
              </Button>
              <Button type="submit">Create Match</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default CreateMatch;
