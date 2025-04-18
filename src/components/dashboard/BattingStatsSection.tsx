
import { useCricket } from '@/context/CricketContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Player } from '@/types/cricket';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

interface BattingStats {
  id: number | string;
  player_id: string;
  player_name: string;
  match_id: string;
  innings_number: number;
  runs: number;
  balls_faced: number;
  fours: number;
  sixes: number;
  is_striker: boolean;
  status: 'not_out' | 'out';
  batting_order: number;
}

interface WicketInfo {
  player_name: string;
  runs: number;
  balls_faced: number;
  wicket_time: string;
  dismissal_type?: string;
}

const BattingStatsSection = () => {
  const { liveMatch, players } = useCricket();
  const [battingStats, setBattingStats] = useState<BattingStats[]>([]);
  const [yetToBat, setYetToBat] = useState<Player[]>([]);
  const [teams, setTeams] = useState<{ team1Name: string; team2Name: string }>({ team1Name: '', team2Name: '' });
  const [activeTab, setActiveTab] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastWicket, setLastWicket] = useState<WicketInfo | null>(null);
  const [ballByBallUpdates, setBallByBallUpdates] = useState<string[]>([]);

  useEffect(() => {
    const fetchTeamNames = async () => {
      if (!liveMatch) return;

      try {
        const { data: teamsData, error } = await supabase
          .from('teams')
          .select('id, name')
          .in('id', [liveMatch.team1Id, liveMatch.team2Id]);

        if (error) {
          console.error('Error fetching team names:', error);
          return;
        }

        const team1 = teamsData.find(team => team.id === liveMatch.team1Id);
        const team2 = teamsData.find(team => team.id === liveMatch.team2Id);

        setTeams({
          team1Name: team1?.name || 'Team 1',
          team2Name: team2?.name || 'Team 2'
        });
        
        // Set active tab based on the current batting team
        const battingTeamId = liveMatch.currentInnings === 1 ? liveMatch.team1Id : liveMatch.team2Id;
        setActiveTab(battingTeamId);
      } catch (error) {
        console.error('Error in fetchTeamNames:', error);
      }
    };

    fetchTeamNames();
  }, [liveMatch]);

  useEffect(() => {
    const fetchBattingStats = async () => {
      if (!liveMatch) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Get match batting stats directly
        const { data: statsData, error: statsError } = await supabase
          .from('match_batting_stats')
          .select('*')
          .eq('match_id', liveMatch.id);

        if (statsError) {
          console.error('Error fetching batting stats:', statsError);
          setError('Failed to load batting statistics');
          return;
        }

        // Get current partnership to identify striker/non-striker
        const { data: partnershipData, error: partnershipError } = await supabase
          .from('batting_partnerships')
          .select('*')
          .eq('match_id', liveMatch.id)
          .eq('innings_number', liveMatch.currentInnings)
          .order('created_at', { ascending: false })
          .limit(1);

        if (partnershipError) {
          console.error('Error fetching partnership:', partnershipError);
        }

        const partnership = partnershipData?.[0];
        
        // Map player details to stats
        const transformedStats: BattingStats[] = statsData.map((stat: any) => {
          // Find player for this stat
          const player = players.find(p => p.id === stat.player_id);
          
          return {
            id: stat.id,
            player_id: stat.player_id,
            player_name: player?.name || 'Unknown Player',
            match_id: stat.match_id,
            innings_number: stat.innings_number,
            runs: stat.runs || 0,
            balls_faced: stat.balls_faced || 0,
            fours: stat.fours || 0,
            sixes: stat.sixes || 0,
            is_striker: partnership ? stat.player_id === partnership.striker_id : false,
            status: stat.is_out ? 'out' : 'not_out',
            batting_order: stat.batting_order || 0
          };
        });

        setBattingStats(transformedStats);

        // Find the last wicket
        const outPlayers = transformedStats.filter(stat => stat.status === 'out');
        if (outPlayers.length > 0) {
          // Sort by most recent (assuming higher batting order means more recent)
          const lastOut = outPlayers.sort((a, b) => b.batting_order - a.batting_order)[0];
          setLastWicket({
            player_name: lastOut.player_name,
            runs: lastOut.runs,
            balls_faced: lastOut.balls_faced,
            wicket_time: new Date().toLocaleTimeString(),
            dismissal_type: 'Bowled' // Placeholder - would come from actual data
          });
        }

        // Update yet to bat list
        const team1Players = players.filter(p => p.team_id === liveMatch.team1Id);
        const team2Players = players.filter(p => p.team_id === liveMatch.team2Id);
        
        const team1BattedPlayers = new Set(
          transformedStats
            .filter(s => {
              const player = players.find(p => p.id === s.player_id);
              return player?.team_id === liveMatch.team1Id;
            })
            .map(s => s.player_id)
        );
        
        const team2BattedPlayers = new Set(
          transformedStats
            .filter(s => {
              const player = players.find(p => p.id === s.player_id);
              return player?.team_id === liveMatch.team2Id;
            })
            .map(s => s.player_id)
        );
        
        const team1YetToBat = team1Players.filter(p => !team1BattedPlayers.has(p.id));
        const team2YetToBat = team2Players.filter(p => !team2BattedPlayers.has(p.id));
        
        setYetToBat({
          [liveMatch.team1Id]: team1YetToBat,
          [liveMatch.team2Id]: team2YetToBat
        }[activeTab] || []);
        
        // Fetch ball-by-ball updates (last 5 balls)
        fetchBallByBallUpdates();
        
      } catch (error) {
        console.error('Error in fetchBattingStats:', error);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    const fetchBallByBallUpdates = async () => {
      if (!liveMatch) return;
      
      try {
        // This is a placeholder - in a real app, you would have a ball_by_ball table
        // For now, we'll generate some sample data
        const sampleUpdates = [
          "Over 4.2: Smith scores 4 runs",
          "Over 4.1: Smith scores 1 run",
          "Over 4.0: Jones scores 0 runs",
          "Over 3.5: Jones scores 6 runs",
          "Over 3.4: WICKET! Martinez bowled by Taylor for 15 runs"
        ];
        
        setBallByBallUpdates(sampleUpdates);
      } catch (error) {
        console.error('Error fetching ball-by-ball updates:', error);
      }
    };

    fetchBattingStats();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`batting-stats-${liveMatch?.id}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'match_batting_stats',
          filter: liveMatch ? `match_id=eq.${liveMatch.id}` : undefined
        }, 
        () => {
          fetchBattingStats();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [liveMatch, liveMatch?.currentInnings, players, activeTab]);

  if (!liveMatch) return <div>No live match in progress</div>;
  
  if (error) {
    return (
      <Card className="shadow-lg border-2 border-cricket-pitch/10">
        <CardHeader className="bg-gradient-to-br from-cricket-primary/5 to-cricket-secondary/5">
          <CardTitle className="text-xl font-semibold">
            Batting Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  const battingTeamId = liveMatch.currentInnings === 1 ? liveMatch.team1Id : liveMatch.team2Id;
  const currentTeamName = battingTeamId === liveMatch.team1Id ? teams.team1Name : teams.team2Name;

  return (
    <Card className="shadow-lg border-2 border-cricket-pitch/10">
      <CardHeader className="bg-gradient-to-br from-cricket-primary/5 to-cricket-secondary/5">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold">
            Batting Statistics - {currentTeamName}
          </CardTitle>
          {lastWicket && (
            <Badge variant="destructive" className="px-3 py-1 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
              Last Wicket: {lastWicket.player_name} ({lastWicket.runs} runs, {lastWicket.balls_faced} balls)
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs 
          defaultValue={battingTeamId} 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-4 grid grid-cols-2 w-full">
            <TabsTrigger 
              value={liveMatch.team1Id}
              className={liveMatch.currentInnings === 1 ? "font-bold" : ""}
            >
              {teams.team1Name}
              {liveMatch.currentInnings === 1 && (
                <span className="ml-2 h-2 w-2 rounded-full bg-green-500 inline-block"></span>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value={liveMatch.team2Id}
              className={liveMatch.currentInnings === 2 ? "font-bold" : ""}
            >
              {teams.team2Name}
              {liveMatch.currentInnings === 2 && (
                <span className="ml-2 h-2 w-2 rounded-full bg-green-500 inline-block"></span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={liveMatch.team1Id}>
            <div className="rounded-lg bg-card overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[300px]">Batter</TableHead>
                    <TableHead className="text-right">R</TableHead>
                    <TableHead className="text-right">B</TableHead>
                    <TableHead className="text-right">4s</TableHead>
                    <TableHead className="text-right">6s</TableHead>
                    <TableHead className="text-right">SR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {battingStats
                    .filter(stat => {
                      const player = players.find(p => p.id === stat.player_id);
                      return player?.team_id === liveMatch.team1Id;
                    })
                    .sort((a, b) => a.batting_order - b.batting_order)
                    .map((stat) => {
                      const strikeRate = stat.balls_faced 
                        ? ((stat.runs / stat.balls_faced) * 100).toFixed(2)
                        : "0.00";

                      return (
                        <TableRow key={stat.id} className={stat.is_striker ? "bg-green-50" : ""}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <span>{stat.player_name}</span>
                              {stat.is_striker && (
                                <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">
                                  *
                                </Badge>
                              )}
                              {stat.status === 'out' && (
                                <Badge variant="destructive" className="opacity-80">
                                  OUT
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right tabular-nums font-medium">{stat.runs}</TableCell>
                          <TableCell className="text-right tabular-nums">{stat.balls_faced}</TableCell>
                          <TableCell className="text-right tabular-nums">{stat.fours}</TableCell>
                          <TableCell className="text-right tabular-nums">{stat.sixes}</TableCell>
                          <TableCell className="text-right tabular-nums">{strikeRate}</TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
            
            {yetToBat.length > 0 && (
              <div className="mt-4 space-y-2 border-t pt-4">
                <h4 className="font-medium">Yet to Bat</h4>
                <div className="text-sm text-muted-foreground">
                  {yetToBat.map(player => player.name).join(' • ')}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value={liveMatch.team2Id}>
            <div className="rounded-lg bg-card overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[300px]">Batter</TableHead>
                    <TableHead className="text-right">R</TableHead>
                    <TableHead className="text-right">B</TableHead>
                    <TableHead className="text-right">4s</TableHead>
                    <TableHead className="text-right">6s</TableHead>
                    <TableHead className="text-right">SR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {battingStats
                    .filter(stat => {
                      const player = players.find(p => p.id === stat.player_id);
                      return player?.team_id === liveMatch.team2Id;
                    })
                    .sort((a, b) => a.batting_order - b.batting_order)
                    .map((stat) => {
                      const strikeRate = stat.balls_faced 
                        ? ((stat.runs / stat.balls_faced) * 100).toFixed(2)
                        : "0.00";

                      return (
                        <TableRow key={stat.id} className={stat.is_striker ? "bg-green-50" : ""}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <span>{stat.player_name}</span>
                              {stat.is_striker && (
                                <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">
                                  *
                                </Badge>
                              )}
                              {stat.status === 'out' && (
                                <Badge variant="destructive" className="opacity-80">
                                  OUT
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right tabular-nums font-medium">{stat.runs}</TableCell>
                          <TableCell className="text-right tabular-nums">{stat.balls_faced}</TableCell>
                          <TableCell className="text-right tabular-nums">{stat.fours}</TableCell>
                          <TableCell className="text-right tabular-nums">{stat.sixes}</TableCell>
                          <TableCell className="text-right tabular-nums">{strikeRate}</TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
            
            {yetToBat.length > 0 && (
              <div className="mt-4 space-y-2 border-t pt-4">
                <h4 className="font-medium">Yet to Bat</h4>
                <div className="text-sm text-muted-foreground">
                  {yetToBat.map(player => player.name).join(' • ')}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Ball-by-ball updates */}
        <div className="mt-6 border-t pt-4">
          <h4 className="font-medium mb-2">Recent Ball-by-Ball Updates</h4>
          <div className="bg-muted/30 rounded-lg p-3 space-y-2 max-h-32 overflow-y-auto">
            {ballByBallUpdates.map((update, index) => (
              <div key={index} className="text-sm flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cricket-primary"></span>
                {update}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BattingStatsSection;
