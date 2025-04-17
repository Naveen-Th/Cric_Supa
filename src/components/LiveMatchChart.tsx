
import { useEffect, useState } from 'react';
import { Match, Team } from '@/types/cricket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle } from 'lucide-react';

interface LiveMatchChartProps {
  match: Match;
  teams: Team[];
}

const LiveMatchChart = ({ match, teams }: LiveMatchChartProps) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [team1Name, setTeam1Name] = useState("");
  const [team2Name, setTeam2Name] = useState("");
  const [matchResult, setMatchResult] = useState<string | null>(null);
  
  // Get team names
  useEffect(() => {
    const team1 = teams.find(t => t.id === match.team1Id);
    const team2 = teams.find(t => t.id === match.team2Id);
    
    if (team1) setTeam1Name(team1.name);
    if (team2) setTeam2Name(team2.name);
  }, [match, teams]);
  
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
              : Math.round((innings1.runs / oversCompleted) * i);
              
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
              : Math.round((innings2.runs / oversCompleted) * i);
              
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
        
        setChartData(processedData.length > 0 ? processedData : [{ over: 0, [team1Name]: 0, [team2Name]: 0 }]);
        
        // Check for match result
        checkMatchResult(innings1, innings2);
      } catch (error) {
        console.error('Error in fetchInningsData:', error);
      }
    };
    
    // Function to check match result based on innings data
    const checkMatchResult = (innings1: any, innings2: any) => {
      if (!innings1 || !innings2) return;
      
      const team1Score = innings1.runs;
      const team2Score = innings2.runs;
      const team2Wickets = innings2.wickets;
      const maxOvers = match.totalOvers;
      const allWickets = 10; // Assuming standard cricket with 10 wickets
      
      // Check win conditions
      if (team2Score > team1Score) {
        // Team 2 wins by wickets
        const wicketsRemaining = allWickets - team2Wickets;
        setMatchResult(`${team2Name} wins by ${wicketsRemaining} wickets`);
      } else if (
        team2Score < team1Score && 
        (innings2.overs >= maxOvers || team2Wickets >= allWickets)
      ) {
        // Team 1 wins by runs
        const runsDifference = team1Score - team2Score;
        setMatchResult(`${team1Name} wins by ${runsDifference} runs`);
      } else if (
        team2Score === team1Score && 
        (innings2.overs >= maxOvers || team2Wickets >= allWickets)
      ) {
        // Match tied
        setMatchResult("Match Tied");
      } else {
        // Match in progress
        setMatchResult(null);
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
            <div className="flex items-center text-sm font-medium text-green-600">
              <AlertCircle className="h-4 w-4 mr-1" />
              {matchResult}
            </div>
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
                      formatter={(value, name) => [`${value} runs`, name]} 
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
