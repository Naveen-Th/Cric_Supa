
import { useState } from 'react';
import { useCricket } from '@/context/CricketContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Match, Team, Player } from '@/types/cricket';
import { Plus, Minus, RefreshCw, StopCircle, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';

interface LiveMatchControlProps {
  match: Match;
  teams: Team[];
}

const LiveMatchControl = ({ match, teams }: LiveMatchControlProps) => {
  const { updateScore, updateOvers, switchInnings, endMatch } = useCricket();
  
  // Get batting and bowling teams
  const team1 = teams.find(t => t.id === match.team1Id);
  const team2 = teams.find(t => t.id === match.team2Id);
  
  if (!team1 || !team2) return null;
  
  const currentInnings = match.currentInnings;
  const battingTeamId = currentInnings === 1 
    ? (match.innings1?.teamId || match.team1Id)
    : (match.innings2?.teamId || match.team2Id);
    
  const bowlingTeamId = battingTeamId === match.team1Id ? match.team2Id : match.team1Id;
  
  const battingTeam = teams.find(t => t.id === battingTeamId);
  const bowlingTeam = teams.find(t => t.id === bowlingTeamId);
  
  if (!battingTeam || !bowlingTeam) return null;
  
  // States for selected players and match control
  const [selectedBatsman, setSelectedBatsman] = useState<string | null>(null);
  const [selectedBowler, setSelectedBowler] = useState<string | null>(null);
  const [customRuns, setCustomRuns] = useState<number>(0);
  const [customOvers, setCustomOvers] = useState<number>(0);
  
  // States for match ending
  const [showEndMatchDialog, setShowEndMatchDialog] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<string>('');
  const [selectedMVP, setSelectedMVP] = useState<string>('');
  
  // Handle run scoring
  const handleAddRuns = (runs: number) => {
    if (!selectedBatsman) {
      toast({
        title: "Batsman not selected",
        description: "Please select a batsman first",
        variant: "destructive",
      });
      return;
    }
    
    updateScore(match.id, runs);
    toast({
      title: `${runs} run${runs !== 1 ? 's' : ''} added`,
      description: `Score updated for ${battingTeam.name}`,
    });
  };
  
  // Handle wicket
  const handleWicket = () => {
    if (!selectedBatsman || !selectedBowler) {
      toast({
        title: "Players not selected",
        description: "Please select both batsman and bowler",
        variant: "destructive",
      });
      return;
    }
    
    updateScore(match.id, 0, 1);
    toast({
      title: "Wicket added",
      description: `${selectedBatsman} dismissed, bowled by ${selectedBowler}`,
    });
  };
  
  // Handle over update
  const handleUpdateOvers = () => {
    if (customOvers <= 0) {
      toast({
        title: "Invalid overs",
        description: "Please enter a positive number for overs",
        variant: "destructive",
      });
      return;
    }
    
    updateOvers(match.id, customOvers);
    toast({
      title: "Overs updated",
      description: `Updated to ${customOvers} overs`,
    });
  };
  
  // Handle innings switch
  const handleSwitchInnings = () => {
    if (currentInnings !== 1) {
      toast({
        title: "Cannot switch innings",
        description: "Already in the second innings",
        variant: "destructive",
      });
      return;
    }
    
    switchInnings(match.id);
    toast({
      title: "Innings switched",
      description: `Now ${bowlingTeam.name} is batting`,
    });
  };
  
  // Handle ending the match
  const handleEndMatch = () => {
    if (!selectedWinner || !selectedMVP) {
      toast({
        title: "Missing information",
        description: "Please select both winner and MVP",
        variant: "destructive",
      });
      return;
    }
    
    endMatch(match.id, selectedWinner, selectedMVP);
    setShowEndMatchDialog(false);
    toast({
      title: "Match ended",
      description: `${teams.find(t => t.id === selectedWinner)?.name} won the match!`,
    });
  };
  
  // Current innings state
  const currentInningsData = currentInnings === 1 ? match.innings1 : match.innings2;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <div className="flex items-center">
                Batting: {battingTeam.name}
                <Badge variant="outline" className="ml-2">
                  {currentInnings === 1 ? '1st Innings' : '2nd Innings'}
                </Badge>
              </div>
              <div>
                <Badge variant="secondary">
                  {currentInningsData?.runs || 0}/{currentInningsData?.wickets || 0}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select Batsman</label>
                <Select onValueChange={setSelectedBatsman} value={selectedBatsman || undefined}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a batsman" />
                  </SelectTrigger>
                  <SelectContent>
                    {battingTeam.players.map(player => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                <Button onClick={() => handleAddRuns(1)} variant="outline">+1</Button>
                <Button onClick={() => handleAddRuns(2)} variant="outline">+2</Button>
                <Button onClick={() => handleAddRuns(4)} variant="outline">+4</Button>
                <Button onClick={() => handleAddRuns(6)} variant="outline">+6</Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Input 
                  type="number" 
                  min="0"
                  value={customRuns} 
                  onChange={(e) => setCustomRuns(Number(e.target.value))} 
                  className="w-20" 
                />
                <Button onClick={() => handleAddRuns(customRuns)} variant="outline">
                  Add Runs
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <div className="flex items-center">
                Bowling: {bowlingTeam.name}
              </div>
              <div>
                <Badge variant="secondary">
                  {currentInningsData?.overs || 0} overs
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select Bowler</label>
                <Select onValueChange={setSelectedBowler} value={selectedBowler || undefined}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a bowler" />
                  </SelectTrigger>
                  <SelectContent>
                    {bowlingTeam.players.map(player => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button onClick={handleWicket} variant="outline">
                  Add Wicket
                </Button>
                
                <div className="flex items-center gap-2 mt-2">
                  <Input 
                    type="number" 
                    min="0"
                    step="0.1"
                    value={customOvers} 
                    onChange={(e) => setCustomOvers(Number(e.target.value))} 
                    className="w-20" 
                  />
                  <Button onClick={handleUpdateOvers} variant="outline">
                    Update Overs
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleSwitchInnings}
          disabled={currentInnings !== 1}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Switch Innings
        </Button>
        
        <Button 
          variant="destructive" 
          onClick={() => setShowEndMatchDialog(true)}
        >
          <StopCircle className="mr-2 h-4 w-4" />
          End Match
        </Button>
      </div>
      
      {/* End Match Dialog */}
      <Dialog open={showEndMatchDialog} onOpenChange={setShowEndMatchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End Match</DialogTitle>
            <DialogDescription>
              Select the winner and Most Valuable Player (MVP) to end the match.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1">Select Winner</label>
              <Select onValueChange={setSelectedWinner} value={selectedWinner}>
                <SelectTrigger>
                  <SelectValue placeholder="Select winning team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={team1.id}>{team1.name}</SelectItem>
                  <SelectItem value={team2.id}>{team2.name}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Select MVP</label>
              <Select onValueChange={setSelectedMVP} value={selectedMVP}>
                <SelectTrigger>
                  <SelectValue placeholder="Select MVP" />
                </SelectTrigger>
                <SelectContent>
                  {[...team1.players, ...team2.players].map(player => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.name} ({teams.find(t => t.id === player.teamId)?.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEndMatchDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEndMatch}>
              End Match
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LiveMatchControl;
