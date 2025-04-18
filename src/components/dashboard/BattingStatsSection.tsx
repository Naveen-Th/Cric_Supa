
import React from 'react';
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

const BattingStatsSection = () => {
  const { liveMatch, players } = useCricket();
  const [battingStats, setBattingStats] = useState<BattingStats[]>([]);
  const [yetToBat, setYetToBat] = useState<Player[]>([]);
  const [teams, setTeams] = useState<{ team1Name: string; team2Name: string }>({ team1Name: '', team2Name: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          .eq('match_id', liveMatch.id)
          .eq('innings_number', liveMatch.currentInnings);

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

        // Update yet to bat list
        const battingTeamId = liveMatch.currentInnings === 1 ? liveMatch.team1Id : liveMatch.team2Id;
        const teamPlayers = players.filter(p => p.team_id === battingTeamId);
        const battedPlayers = new Set(transformedStats.map(s => s.player_id));
        setYetToBat(teamPlayers.filter(p => !battedPlayers.has(p.id)));
        
      } catch (error) {
        console.error('Error in fetchBattingStats:', error);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
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
  }, [liveMatch, liveMatch?.currentInnings, players]);

  if (!liveMatch) return <div>No live match in progress</div>;
  
  if (loading) {
    return (
      <Card className="shadow-lg border-2 border-cricket-pitch/10">
        <CardHeader className="bg-gradient-to-br from-cricket-primary/5 to-cricket-secondary/5">
          <CardTitle className="text-xl font-semibold">
            Loading Batting Statistics...
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
        <CardTitle className="text-xl font-semibold">
          Batting Statistics - {currentTeamName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={liveMatch.team1Id}>
          <TabsList className="mb-4">
            <TabsTrigger value={liveMatch.team1Id}>{teams.team1Name}</TabsTrigger>
            <TabsTrigger value={liveMatch.team2Id}>{teams.team2Name}</TabsTrigger>
          </TabsList>

          <TabsContent value={liveMatch.team1Id}>
            <Table>
              <TableHeader>
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
                  .map((stat) => {
                    const strikeRate = stat.balls_faced 
                      ? ((stat.runs / stat.balls_faced) * 100).toFixed(2)
                      : "0.00";

                    return (
                      <TableRow key={stat.id}>
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
                        <TableCell className="text-right tabular-nums">{stat.runs}</TableCell>
                        <TableCell className="text-right tabular-nums">{stat.balls_faced}</TableCell>
                        <TableCell className="text-right tabular-nums">{stat.fours}</TableCell>
                        <TableCell className="text-right tabular-nums">{stat.sixes}</TableCell>
                        <TableCell className="text-right tabular-nums">{strikeRate}</TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value={liveMatch.team2Id}>
            <Table>
              <TableHeader>
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
                  .map((stat) => {
                    const strikeRate = stat.balls_faced 
                      ? ((stat.runs / stat.balls_faced) * 100).toFixed(2)
                      : "0.00";

                    return (
                      <TableRow key={stat.id}>
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
                        <TableCell className="text-right tabular-nums">{stat.runs}</TableCell>
                        <TableCell className="text-right tabular-nums">{stat.balls_faced}</TableCell>
                        <TableCell className="text-right tabular-nums">{stat.fours}</TableCell>
                        <TableCell className="text-right tabular-nums">{stat.sixes}</TableCell>
                        <TableCell className="text-right tabular-nums">{strikeRate}</TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>

        {yetToBat.length > 0 && (
          <div className="mt-4 space-y-2 border-t pt-4">
            <h4 className="font-medium">Yet to Bat</h4>
            <div className="text-sm text-muted-foreground">
              {yetToBat.map(player => player.name).join(' • ')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BattingStatsSection;
