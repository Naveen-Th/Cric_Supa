
import { useEffect, useState } from 'react';
import { Match, Team } from '@/types/cricket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Legend, Tooltip, LineChart, Line, Bar, BarChart } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Flag, BarChart as BarChartIcon, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCricket } from '@/context/CricketContext';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LiveMatchChartProps {
  match: Match;
  teams: Team[];
}

interface OverData {
  over: number;
  [key: string]: number | string; // For team runs
  runsInOver?: number;
  wicketsInOver?: number;
}

const LiveMatchChart = ({ match, teams }: LiveMatchChartProps) => {
  const { switchInnings, endMatch, updateMatch } = useCricket();
  const [chartData, setChartData] = useState<any[]>([]);
  const [overByOverData, setOverByOverData] = useState<OverData[]>([]);
  const [team1Name, setTeam1Name] = useState("");
  const [team2Name, setTeam2Name] = useState("");
  const [matchResult, setMatchResult] = useState<string | null>(null);
  const [isAutoProcessing, setIsAutoProcessing] = useState(false);
  const [activeChart, setActiveChart] = useState<'progression' | 'overByOver'>('progression');
  
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
        const processedOverData: OverData[] = [];
        
        // First innings data
        const innings1 = inningsData.find(inn => inn.innings_number === 1);
        
        if (innings1) {
          const overs = Math.floor(innings1.overs);
          const balls = Math.round((innings1.overs - overs) * 10);
          
          let totalRuns = 0;
          // Generate data points for each over
          for (let i = 0; i <= overs; i++) {
            const isCurrentOver = i === overs;
            
            // In a real app, this would come from actual over-by-over data
            // For now, we'll simulate random runs per over
            const runsInOver = isCurrentOver 
              ? Math.round((innings1.runs * 0.1) * (Math.random() + 0.5))
              : Math.round((innings1.runs / Math.max(overs, 1)) * (Math.random() + 0.5));
              
            totalRuns += runsInOver;
            
            // Generate random wickets (0 or 1 most of the time)
            const wicketsInOver = Math.random() > 0.8 ? 1 : 0;
            
            const dataPoint: any = {
              over: i,
              [team1Name]: totalRuns,
              runsInOver: runsInOver,
              wicketsInOver: wicketsInOver
            };
            
            processedData.push(dataPoint);
            
            processedOverData.push({
              over: i,
              runsInOver,
              wicketsInOver,
              [team1Name]: runsInOver
            });
          }
        }
        
        // Second innings data
        const innings2 = inningsData.find(inn => inn.innings_number === 2);
        
        if (innings2) {
          const overs2 = Math.floor(innings2.overs);
          const balls2 = Math.round((innings2.overs - overs2) * 10);
          
          let totalRuns = 0;
          // Update existing data points and add new ones if needed
          for (let i = 0; i <= overs2; i++) {
            const isCurrentOver = i === overs2;
            
            // Simulate random runs per over for second innings
            const runsInOver = isCurrentOver 
              ? Math.round((innings2.runs * 0.1) * (Math.random() + 0.5))
              : Math.round((innings2.runs / Math.max(overs2, 1)) * (Math.random() + 0.5));
              
            totalRuns += runsInOver;
            
            // Generate random wickets (0 or 1 most of the time)
            const wicketsInOver = Math.random() > 0.8 ? 1 : 0;
            
            if (i < processedData.length) {
              // Update existing data point
              processedData[i][team2Name] = totalRuns;
              processedOverData[i][team2Name] = runsInOver;
            } else {
              // Add new data point
              const dataPoint: any = {
                over: i,
                [team2Name]: totalRuns,
                runsInOver: 0,
                wicketsInOver: 0
              };
              
              if (innings1) {
                dataPoint[team1Name] = innings1.runs;
              }
              
              const overDataPoint: OverData = {
                over: i,
                runsInOver,
                wicketsInOver,
                [team2Name]: runsInOver
              };
              
              processedData.push(dataPoint);
              processedOverData.push(overDataPoint);
            }
          }
        }
        
        // Ensure we have data to display
        setChartData(processedData.length > 0 ? processedData : [{ over: 0, [team1Name]: 0, [team2Name]: 0 }]);
        setOverByOverData(processedOverData.length > 0 ? processedOverData : [{ over: 0, runsInOver: 0, wicketsInOver: 0 }]);
        
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
    <Card className="w-full shadow-md border-2 border-cricket-pitch/10">
      <CardHeader className="pb-2 bg-gradient-to-br from-cricket-primary/5 to-cricket-secondary/5">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-cricket-secondary" />
            Match Progress
          </CardTitle>
          {matchResult && (
            <Badge variant="outline" className="flex items-center text-sm font-medium text-green-600 border-green-300 bg-green-50">
              <Trophy className="h-4 w-4 mr-1 text-green-600" />
              {matchResult}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs 
          defaultValue="progression" 
          value={activeChart}
          onValueChange={(value) => setActiveChart(value as 'progression' | 'overByOver')}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="progression">Run Progression</TabsTrigger>
            <TabsTrigger value="overByOver">Over by Over</TabsTrigger>
          </TabsList>
          
          <TabsContent value="progression" className="pt-2">
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
                    <defs>
                      <linearGradient id="colorTeam1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorTeam2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis 
                      dataKey="over" 
                      label={{ value: 'Overs', position: 'insideBottomRight', offset: -5 }} 
                    />
                    <YAxis 
                      label={{ value: 'Runs', angle: -90, position: 'insideLeft' }} 
                    />
                    <Tooltip 
                      formatter={(value, name) => [`${value} runs`, name]}
                      labelFormatter={(label) => `Over ${label}`}
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey={team1Name} 
                      name={team1Name}
                      stroke="#4f46e5" 
                      fill="url(#colorTeam1)" 
                      fillOpacity={1}
                      activeDot={{ r: 6 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey={team2Name} 
                      name={team2Name}
                      stroke="#f97316" 
                      fill="url(#colorTeam2)" 
                      fillOpacity={1}
                      activeDot={{ r: 6 }}
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
                    <Legend verticalAlign="top" height={36} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="overByOver" className="pt-2">
            <div className="h-[300px]">
              <ChartContainer>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={overByOverData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis 
                      dataKey="over" 
                      label={{ value: 'Overs', position: 'insideBottomRight', offset: -5 }} 
                    />
                    <YAxis 
                      label={{ value: 'Runs per Over', angle: -90, position: 'insideLeft' }} 
                      allowDecimals={false}
                    />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'wicketsInOver') return [`${value} wicket(s)`, 'Wickets'];
                        return [`${value} runs`, name === team1Name ? team1Name : team2Name];
                      }}
                      labelFormatter={(label) => `Over ${label}`}
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Bar 
                      dataKey={team1Name} 
                      name={team1Name}
                      fill="#4f46e5" 
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey={team2Name} 
                      name={team2Name}
                      fill="#f97316" 
                      radius={[4, 4, 0, 0]}
                    />
                    <ReferenceLine y={0} stroke="#000" />
                    <Legend verticalAlign="top" height={36} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LiveMatchChart;
