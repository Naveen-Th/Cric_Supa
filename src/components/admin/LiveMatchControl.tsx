import { useState, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';

interface MatchLocalStorage {
  striker: string | null;
  nonStriker: string | null;
  selectedBowler: string | null;
  currentOvers: number;
  currentRuns: number;
  dismissedPlayers: string[];
}

const STORAGE_KEY = 'cricket_match_state_';

const saveToLocalStorage = (matchId: string, data: MatchLocalStorage) => {
  localStorage.setItem(STORAGE_KEY + matchId, JSON.stringify(data));
};

const loadFromLocalStorage = (matchId: string): MatchLocalStorage | null => {
  const data = localStorage.getItem(STORAGE_KEY + matchId);
  return data ? JSON.parse(data) : null;
};

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
  const [striker, setStriker] = useState<string | null>(null);
  const [nonStriker, setNonStriker] = useState<string | null>(null);
  const [selectedBowler, setSelectedBowler] = useState<string | null>(null);
  const [customRuns, setCustomRuns] = useState<number>(0);
  const [customOvers, setCustomOvers] = useState<number>(0);
  const [isWicket, setIsWicket] = useState<boolean>(false);
  const [dismissedPlayers, setDismissedPlayers] = useState<string[]>([]); // Track dismissed players
  
  // States for match ending
  const [showEndMatchDialog, setShowEndMatchDialog] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<string>('');
  const [selectedMVP, setSelectedMVP] = useState<string>('');
  
  // Current innings state
  const currentInningsData = currentInnings === 1 ? match.innings1 : match.innings2;

  // Load initial state from localStorage
  useEffect(() => {
    const savedState = loadFromLocalStorage(match.id);
    if (savedState) {
      setStriker(savedState.striker);
      setNonStriker(savedState.nonStriker);
      setSelectedBowler(savedState.selectedBowler);
      setCustomOvers(savedState.currentOvers);
      setCustomRuns(savedState.currentRuns);
      setDismissedPlayers(savedState.dismissedPlayers);
    }
  }, [match.id]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    saveToLocalStorage(match.id, {
      striker,
      nonStriker,
      selectedBowler,
      currentOvers: currentInningsData?.overs || 0,
      currentRuns: currentInningsData?.runs || 0,
      dismissedPlayers,
    });
  }, [
    match.id,
    striker,
    nonStriker,
    selectedBowler,
    currentInningsData?.overs,
    currentInningsData?.runs,
    dismissedPlayers
  ]);
  
  // Update player stats in Supabase
  const updatePlayerStats = async (playerId: string, runs: number, isWicket: boolean = false) => {
    try {
      if (!playerId) return;
      
      // Get current batting stats
      const { data: battingData, error: battingError } = await supabase
        .from('batting_stats')
        .select('*')
        .eq('player_id', playerId)
        .single();
        
      if (battingError && battingError.code !== 'PGRST116') {
        console.error('Error fetching batting stats:', battingError);
        return;
      }
      
      // Calculate new stats
      const isFour = runs === 4;
      const isSix = runs === 6;
      
      if (battingData) {
        // Update existing stats
        await supabase
          .from('batting_stats')
          .update({
            runs: battingData.runs + runs,
            balls_faced: battingData.balls_faced + 1,
            fours: battingData.fours + (isFour ? 1 : 0),
            sixes: battingData.sixes + (isSix ? 1 : 0)
          })
          .eq('player_id', playerId);
      } else {
        // Create new stats
        await supabase
          .from('batting_stats')
          .insert({
            player_id: playerId,
            runs: runs,
            balls_faced: 1,
            fours: isFour ? 1 : 0,
            sixes: isSix ? 1 : 0
          });
      }
      
      // If it's a wicket, update bowling stats
      if (isWicket && selectedBowler) {
        const { data: bowlingData, error: bowlingError } = await supabase
          .from('bowling_stats')
          .select('*')
          .eq('player_id', selectedBowler)
          .single();
          
        if (bowlingError && bowlingError.code !== 'PGRST116') {
          console.error('Error fetching bowling stats:', bowlingError);
          return;
        }
        
        if (bowlingData) {
          // Update existing stats
          await supabase
            .from('bowling_stats')
            .update({
              wickets: bowlingData.wickets + 1,
              runs: bowlingData.runs + runs
            })
            .eq('player_id', selectedBowler);
        } else {
          // Create new stats
          await supabase
            .from('bowling_stats')
            .insert({
              player_id: selectedBowler,
              wickets: 1,
              runs: runs,
              overs: 0
            });
        }
      }
    } catch (error) {
      console.error('Error updating player stats:', error);
    }
  };
  
  // Update bowler's overs
  const updateBowlerOvers = async (bowlerId: string, overs: number) => {
    try {
      if (!bowlerId) return;
      
      const { data: bowlingData, error: bowlingError } = await supabase
        .from('bowling_stats')
        .select('*')
        .eq('player_id', bowlerId)
        .single();
        
      if (bowlingError && bowlingError.code !== 'PGRST116') {
        console.error('Error fetching bowling stats:', bowlingError);
        return;
      }
      
      if (bowlingData) {
        // Update existing stats
        await supabase
          .from('bowling_stats')
          .update({
            overs: overs
          })
          .eq('player_id', bowlerId);
      } else {
        // Create new stats
        await supabase
          .from('bowling_stats')
          .insert({
            player_id: bowlerId,
            wickets: 0,
            runs: 0,
            overs: overs
          });
      }
    } catch (error) {
      console.error('Error updating bowler overs:', error);
    }
  };
  
  // Calculate new overs based on balls
  const calculateNewOvers = (currentOvers: number): number => {
    const oversPart = Math.floor(currentOvers);
    const ballsPart = Math.round((currentOvers - oversPart) * 10);

    const newBallsPart = ballsPart + 1;
    if (newBallsPart > 5) {
      return oversPart + 1; // Move to the next over
    }
    return oversPart + newBallsPart / 10; // Increment balls
  };

  // Handle run scoring
  const handleAddRuns = async (runs: number, isSpecialDelivery: boolean = false) => {
    if (!striker) {
      toast({
        title: "Striker not selected",
        description: "Please select a striker first",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedBowler) {
      toast({
        title: "Bowler not selected",
        description: "Please select a bowler first",
        variant: "destructive",
      });
      return;
    }
    
    // Update match score
    updateScore(match.id, runs);
    
    // Update player stats if not a special delivery (wide/no-ball)
    if (!isSpecialDelivery) {
      await updatePlayerStats(striker, runs);

      // Increment balls for valid deliveries
      const newOvers = calculateNewOvers(currentInningsData?.overs || 0);
      updateOvers(match.id, newOvers);
      
      // Update bowler's overs
      await updateBowlerOvers(selectedBowler, newOvers);
    }
    
    toast({
      title: `${runs} run${runs !== 1 ? 's' : ''} added`,
      description: `Score updated for ${battingTeam.name}`,
    });
  };

  // Handle special deliveries
  const handleSpecialDelivery = async (type: 'wide' | 'no-ball') => {
    if (!selectedBowler) {
      toast({
        title: "Bowler not selected",
        description: "Please select a bowler first",
        variant: "destructive",
      });
      return;
    }

    // Add 1 run to the score without increasing ball count
    updateScore(match.id, 1);
    
    // For special deliveries, only update runs in bowling stats, not overs
    try {
      const { data: bowlingData } = await supabase
        .from('bowling_stats')
        .select('*')
        .eq('player_id', selectedBowler)
        .single();
        
      if (bowlingData) {
        await supabase
          .from('bowling_stats')
          .update({
            runs: bowlingData.runs + 1
          })
          .eq('player_id', selectedBowler);
      } else {
        await supabase
          .from('bowling_stats')
          .insert({
            player_id: selectedBowler,
            wickets: 0,
            runs: 1,
            overs: 0
          });
      }
    } catch (error) {
      console.error('Error updating bowling stats:', error);
    }
    
    toast({
      title: type === 'wide' ? 'Wide ball' : 'No ball',
      description: `1 run added to ${battingTeam.name}`,
    });
  };

  // Handle wicket
  const handleWicket = async () => {
    if (!striker || !selectedBowler) {
      toast({
        title: "Players not selected",
        description: "Please select both striker and bowler",
        variant: "destructive",
      });
      return;
    }
    
    setIsWicket(true);
    setDismissedPlayers(prev => [...prev, striker]);
    
    // Update match score (0 runs, 1 wicket)
    updateScore(match.id, 0, 1);
    
    // Update player stats
    await updatePlayerStats(striker, 0, true);

    // Increment balls for valid deliveries
    const newOvers = calculateNewOvers(currentInningsData?.overs || 0);
    updateOvers(match.id, newOvers);
    
    toast({
      title: "Wicket added",
      description: `${striker} dismissed, bowled by ${selectedBowler}`,
    });
    
    // Reset striker
    setStriker(null);
  };
  
  // Handle over update - correcting the ball and over logic
  const handleUpdateOvers = async () => {
    if (customOvers <= 0) {
      toast({
        title: "Invalid overs",
        description: "Please enter a positive number for overs",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedBowler) {
      toast({
        title: "Bowler not selected",
        description: "Please select a bowler first",
        variant: "destructive",
      });
      return;
    }
    
    // Fix the over format (0.5 should be followed by 1.0, not 0.6)
    let formattedOvers = customOvers;
    const oversPart = Math.floor(customOvers);
    const ballsPart = Math.round((customOvers - oversPart) * 10); // Get decimal part
    
    if (ballsPart > 5) {
      formattedOvers = oversPart + 1; // Move to next over
    }
    
    // Update match overs
    updateOvers(match.id, formattedOvers);
    
    // Update bowler stats
    await updateBowlerOvers(selectedBowler, formattedOvers);
    
    toast({
      title: "Overs updated",
      description: `Updated to ${formattedOvers} overs`,
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
    
    // Reset player selections
    setStriker(null);
    setNonStriker(null);
    setSelectedBowler(null);
    setDismissedPlayers([]);
    
    // Clear localStorage for this match
    localStorage.removeItem(STORAGE_KEY + match.id);
    
    toast({
      title: "Innings switched",
      description: `Now ${bowlingTeam.name} is batting`,
    });
  };

  // Modify the handleEndMatch function
  const handleEndMatch = () => {
    if (!selectedMVP) {
      toast({
        title: "Missing information",
        description: "Please select the MVP",
        variant: "destructive",
      });
      return;
    }

    // Update match with winner
    endMatch(match.id, selectedWinner, selectedMVP);
    setShowEndMatchDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-blue-100/50">
            <CardTitle className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-blue-700">Batting: {battingTeam.name}</span>
                <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-700 border-blue-300">
                  {currentInnings === 1 ? '1st Innings' : '2nd Innings'}
                </Badge>
              </div>
              <div>
                <Badge className="bg-blue-600 text-white text-lg px-4 py-1">
                  {currentInningsData?.runs || 0}/{currentInningsData?.wickets || 0}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Select Striker</label>
              <Select onValueChange={setStriker} value={striker || undefined}>
                <SelectTrigger>
                  <SelectValue placeholder="Select striker" />
                </SelectTrigger>
                <SelectContent>
                  {battingTeam.players?.map(player => (
                    <SelectItem 
                      key={player.id} 
                      value={player.id}
                      className={`
                        ${dismissedPlayers.includes(player.id) 
                          ? 'bg-red-50 text-red-700 line-through opacity-50' 
                          : ''}
                      `}
                      disabled={dismissedPlayers.includes(player.id)}
                    >
                      {player.name}
                      {dismissedPlayers.includes(player.id) && ' (Out)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Select Non-Striker</label>
              <Select onValueChange={setNonStriker} value={nonStriker || undefined}>
                <SelectTrigger>
                  <SelectValue placeholder="Select non-striker" />
                </SelectTrigger>
                <SelectContent>
                  {battingTeam.players?.filter(p => 
                    p.id !== striker && !dismissedPlayers.includes(p.id)
                  ).map(player => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              <Button onClick={() => handleAddRuns(1)} 
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300">+1</Button>
              <Button onClick={() => handleAddRuns(2)} 
                className="bg-green-100 hover:bg-green-200 text-green-700 border border-green-300">+2</Button>
              <Button onClick={() => handleAddRuns(4)} 
                className="bg-purple-100 hover:bg-purple-200 text-purple-700 border border-purple-300">+4</Button>
              <Button onClick={() => handleAddRuns(6)} 
                className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 border border-indigo-300">+6</Button>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <Button onClick={() => handleSpecialDelivery('wide')} 
                className="bg-amber-100 hover:bg-amber-200 text-amber-700 border border-amber-300">Wide</Button>
              <Button onClick={() => handleSpecialDelivery('no-ball')} 
                className="bg-orange-100 hover:bg-orange-200 text-orange-700 border border-orange-300">No Ball</Button>
              <Button onClick={handleWicket} 
                className="bg-red-100 hover:bg-red-200 text-red-700 border border-red-300">Wicket</Button>
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
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-50 to-white border-2 border-emerald-200 shadow-lg">
          <CardHeader className="bg-emerald-100/50">
            <CardTitle className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-emerald-700">Bowling: {bowlingTeam.name}</span>
              </div>
              <div>
                <Badge className="bg-emerald-600 text-white text-lg px-4 py-1">
                  {currentInningsData?.overs || 0} overs
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Select Bowler</label>
              <Select onValueChange={setSelectedBowler} value={selectedBowler || undefined}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a bowler" />
                </SelectTrigger>
                <SelectContent>
                  {bowlingTeam.players?.map(player => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {isWicket && (
              <div className="bg-red-50 p-3 rounded-md border border-red-200">
                <p className="text-sm text-red-700 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  A wicket has been taken. Select a new striker to continue.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between mt-8">
        <Button 
          variant="outline" 
          onClick={handleSwitchInnings}
          disabled={currentInnings !== 1}
          className="bg-cyan-100 hover:bg-cyan-200 text-cyan-700 border border-cyan-300 disabled:opacity-50"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Switch Innings
        </Button>
        
        <Button 
          onClick={() => setShowEndMatchDialog(true)}
          className="bg-rose-600 hover:bg-rose-700 text-white"
        >
          <StopCircle className="mr-2 h-4 w-4" />
          End Match
        </Button>
      </div>
      
      {/* End Match Dialog */}
      <Dialog open={showEndMatchDialog} onOpenChange={setShowEndMatchDialog}>
        <DialogContent className="bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200">
          <DialogHeader className="bg-slate-100/50 rounded-t-lg p-4">
            <DialogTitle className="text-slate-700">End Match</DialogTitle>
            <DialogDescription className="text-slate-600">
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
                  {[...team1.players || [], ...team2.players || []].map(player => (
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
