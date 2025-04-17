
import { useEffect, useState } from 'react';
import { Match, Team } from '@/types/cricket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Flag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCricket } from '@/context/CricketContext';
import { toast } from '@/components/ui/use-toast';

interface LiveMatchChartProps {
  match: Match;
  teams: Team[];
}

const LiveMatchChart = ({ match, teams }: LiveMatchChartProps) => {
  const { switchInnings, endMatch, updateMatch } = useCricket();
  const [chartData, setChartData] = useState<any[]>([]);
  const [team1Name, setTeam1Name] = useState("");
  const [team2Name, setTeam2Name] = useState("");
  const [matchResult, setMatchResult] = useState<string | null>(null);
  const [isAutoProcessing, setIsAutoProcessing] = useState(false);
  
  // Get team names
  useEffect(() => {
    const team1 = teams.find(t => t.id === match.team1Id);
    const team2 = teams.find(t => t.id === match.team2Id);
    
    if (team1) setTeam1Name(team1.name);
    if (team2) setTeam2Name(team2.name);
  }, [match, teams]);
  
  // Function to handle auto innings switching
  const handleAutoInningsSwitch = async (innings1: any) => {
    if (isAutoProcessing || match.status !== 'live') return;
    
    // Check if we need to switch innings automatically
    if (match.currentInnings === 1 && innings1) {
      const maxOvers = match.totalOvers;
      const allWickets = 10; // Standard cricket has 10 wickets per team
      
      // Check if first innings should end (all overs completed or all wickets lost)
      if (innings1.overs >= maxOvers || innings1.wickets >= allWickets) {
        setIsAutoProcessing(true);
        console.log('Auto-switching innings after innings 1 completed');
        
        try {
          await switchInnings(match.id);
          console.log('Innings switched automatically');
          toast({
            title: 'Innings Complete',
            description: `${team1Name} innings complete. ${team2Name} now batting.`,
          });
        } catch (error) {
          console.error('Error auto-switching innings:', error);
        } finally {
          setIsAutoProcessing(false);
        }
      }
    }
  };

  // Function to handle auto match end
  const handleAutoMatchEnd = async (innings1: any, innings2: any) => {
    if (isAutoProcessing || !innings1 || !innings2 || match.status !== 'live') return;
    
    const team1Score = innings1.runs;
    const team2Score = innings2.runs;
    const team2Wickets = innings2.wickets;
    const maxOvers = match.totalOvers;
    const allWickets = 10;
    
    // Determine if match should end automatically
    const shouldEndMatch = 
      // Team 2 surpassed Team 1's score
      (team2Score > team1Score) ||
      // Team 2 completed all overs
      (innings2.overs >= maxOvers) ||
      // Team 2 lost all wickets
      (team2Wickets >= allWickets);
      
    if (shouldEndMatch) {
      setIsAutoProcessing(true);
      
      // Determine winner
      let winnerId: string | undefined;
      let resultMessage: string;
      
      if (team2Score > team1Score) {
        winnerId = match.team2Id;
        const wicketsRemaining = allWickets - team2Wickets;
        resultMessage = `${team2Name} wins by ${wicketsRemaining} wickets`;
        setMatchResult(resultMessage);
      } else if (team2Score < team1Score) {
        winnerId = match.team1Id;
        const runsDifference = team1Score - team2Score;
        resultMessage = `${team1Name} wins by ${runsDifference} runs`;
        setMatchResult(resultMessage);
      } else {
        // Match tied
        resultMessage = "Match Tied";
        setMatchResult(resultMessage);
      }
      
      try {
        // For auto-ending, we'll use a simplified MVP selection
        // In a real app, you'd want more sophisticated logic here
        const mvpId = winnerId === match.team1Id 
          ? innings1.teamId // Use first innings batting team player
          : innings2.teamId; // Use second innings batting team player
          
        if (winnerId) {
          console.log(`Auto-ending match, winner: ${winnerId}`);
          await endMatch(match.id, winnerId, mvpId);
          toast({
            title: 'Match Complete',
            description: resultMessage,
          });
        } else {
          // Handle tied match
          console.log('Match tied - updating status to completed');
          const updatedMatch = {
            ...match,
            status: 'completed' as const
          };
          await updateMatch(updatedMatch);
          toast({
            title: 'Match Complete',
            description: 'Match ended in a tie!',
          });
        }
      } catch (error) {
        console.error('Error auto-ending match:', error);
      } finally {
        setIsAutoProcessing(false);
      }
    }
  };
  
  // Check match result based on innings data
  const checkMatchResult = (innings1: any, innings2: any) => {
    if (!innings1) return;
    
    const team1Score = innings1.runs;
    
    if (!innings2) {
      // First innings still in progress
      return;
    }
    
    const team2Score = innings2.runs;
    const team2Wickets = innings2.wickets;
    const maxOvers = match.totalOvers;
    const allWickets = 10;
    
    // Team 2 batting and already surpassed Team 1's score
    if (team2Score > team1Score) {
      // Team 2 wins by wickets
      const wicketsRemaining = allWickets - team2Wickets;
      setMatchResult(`${team2Name} wins by ${wicketsRemaining} wickets`);
      return;
    }
    
    // Check if innings 2 is complete (either all overs used or all wickets lost)
    if (innings2.overs >= maxOvers || team2Wickets >= allWickets) {
      // Team 1 wins by runs
      if (team2Score < team1Score) {
        const runsDifference = team1Score - team2Score;
        setMatchResult(`${team1Name} wins by ${runsDifference} runs`);
      } 
      // Match tied
      else if (team2Score === team1Score) {
        setMatchResult("Match Tied");
      }
    }
  };
  
  // Format the chart tooltip
  const formatChartTooltip = (value: any, name: string) => {
    return [`${value} runs`, name];
  };
  
  // Fetch chart data and set up real-time listeners
  useEffect(() => {
    // Function to fetch innings data
    const fetchInningsData = async () => {
      try {
        const { data: inningsData, error } = await supabase
          .from('innings')
          .select('*')
          .eq('match_id', match.id)
          .order('innings_number', { ascending: true });
          
        if (error) {
          console.error('Error fetching innings data:', error);
          return;
        }
        
        if (!inningsData || inningsData.length === 0) {
          setChartData([{ over: 0, [team1Name]: 0, [team2Name]: 0 }]);
          return;
        }
        
        // Transform innings data to chart format
        const processedData: any[] = [];
        
        // First innings data
        const innings1 = inningsData.find(inn => inn.innings_number === 1);
        if (innings1) {
          const overs = Math.floor(innings1.overs);
          const balls = Math.round((innings1.overs - overs) * 10);
          
          // Generate data points for each over
          for (let i = 0; i <= overs; i++) {
            const isCurrentOver = i === overs;
            const oversCompleted = isCurrentOver ? (i + balls / 10) : i;
            
            // Calculate runs for first innings up to this over
            // This is a simplified calculation - in a real app you'd want actual per-over data
            const runsAtOver = isCurrentOver 
              ? innings1.runs
              : Math.round((innings1.runs / Math.max(oversCompleted, 1)) * i);
              
            const dataPoint: any = {
              over: i,
              [team1Name]: runsAtOver,
            };
            
            processedData.push(dataPoint);
          }
        }
        
        // Second innings data
        const innings2 = inningsData.find(inn => inn.innings_number === 2);
        if (innings2) {
          const overs2 = Math.floor(innings2.overs);
          const balls2 = Math.round((innings2.overs - overs2) * 10);
          
          // Update existing data points and add new ones if needed
          for (let i = 0; i <= overs2; i++) {
            const isCurrentOver = i === overs2;
            const oversCompleted = isCurrentOver ? (i + balls2 / 10) : i;
            
            // Calculate runs for second innings up to this over
            const runsAtOver = isCurrentOver 
              ? innings2.runs
              : Math.round((innings2.runs / Math.max(oversCompleted, 1)) * i);
              
            if (i < processedData.length) {
              // Update existing data point
              processedData[i][team2Name] = runsAtOver;
            } else {
              // Add new data point
              const dataPoint: any = {
                over: i,
                [team2Name]: runsAtOver,
              };
              
              if (innings1) {
                dataPoint[team1Name] = innings1.runs;
              }
              
              processedData.push(dataPoint);
            }
          }
        }
        
        // Ensure we have data to display
        setChartData(processedData.length > 0 ? processedData : [{ over: 0, [team1Name]: 0, [team2Name]: 0 }]);
        
        // Check for auto-actions
        handleAutoInningsSwitch(innings1);
        handleAutoMatchEnd(innings1, innings2);
        
        // Also update the UI with match result (even if not auto-ending)
        checkMatchResult(innings1, innings2);
      } catch (error) {
        console.error('Error in fetchInningsData:', error);
      }
    };
    
    // Initial fetch
    if (match && team1Name && team2Name) {
      fetchInningsData();
    }
    
    // Subscribe to real-time updates
    const inningsChannel = supabase
      .channel('innings-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'innings',
          filter: `match_id=eq.${match.id}` 
        }, 
        () => {
          fetchInningsData();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(inningsChannel);
    };
  }, [match, team1Name, team2Name]);
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Match Progress</span>
          {matchResult && (
            <Badge variant="outline" className="flex items-center text-sm font-medium text-green-600 border-green-300 bg-green-50">
              <Trophy className="h-4 w-4 mr-1 text-green-600" />
              {matchResult}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer
            config={{
              [team1Name]: { color: "#4f46e5" },
              [team2Name]: { color: "#f97316" },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="over" 
                  label={{ value: 'Overs', position: 'insideBottomRight', offset: -5 }} 
                />
                <YAxis 
                  label={{ value: 'Runs', angle: -90, position: 'insideLeft' }} 
                />
                <ChartTooltip 
                  content={
                    <ChartTooltipContent 
                      formatter={formatChartTooltip} 
                    />
                  } 
                />
                <Area 
                  type="monotone" 
                  dataKey={team1Name} 
                  name={team1Name}
                  stroke="#4f46e5" 
                  fill="#4f46e5" 
                  fillOpacity={0.3}
                  stackId="1" 
                />
                <Area 
                  type="monotone" 
                  dataKey={team2Name} 
                  name={team2Name}
                  stroke="#f97316" 
                  fill="#f97316" 
                  fillOpacity={0.3}
                  stackId="2" 
                />
                {match.innings1 && (
                  <ReferenceLine 
                    y={match.innings1.runs} 
                    stroke="#4f46e5" 
                    strokeDasharray="3 3" 
                    label={{ 
                      position: 'right',
                      value: `${team1Name}: ${match.innings1.runs}`,
                      fill: '#4f46e5',
                      fontSize: 12
                    }} 
                  />
                )}
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveMatchChart;
