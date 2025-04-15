import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Match, Team, Player, MatchStatus } from '@/types/cricket';
import { useCricket } from '@/context/CricketContext';
import { ArrowLeft, CalendarIcon, MapPinIcon, Trophy, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import LiveMatchWrapper from '@/components/LiveMatchWrapper';

const MatchDetails = () => {
  const { id: matchId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { teams } = useCricket();
  
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [team1, setTeam1] = useState<Team | null>(null);
  const [team2, setTeam2] = useState<Team | null>(null);
  const [winner, setWinner] = useState<Team | null>(null);
  const [mvp, setMvp] = useState<Player | null>(null);
  
  useEffect(() => {
    const fetchMatchDetails = async () => {
      if (!matchId) return;
      
      try {
        setLoading(true);
        
        // Use direct Supabase query to get match details
        const { data, error } = await supabase
          .from('matches')
          .select(`
            *,
            team1:team1_id(name),
            team2:team2_id(name),
            winner:winner_id(name),
            mvp:mvp_id(name)
          `)
          .eq('id', matchId)
          .single();
          
        if (error) {
          console.error('Error fetching match:', error);
          return;
        }
        
        if (data) {
          // Convert from database format to our Match type
          const matchData: Match = {
            id: data.id,
            team1Id: data.team1_id,
            team2Id: data.team2_id,
            date: data.date,
            venue: data.venue,
            status: data.status as MatchStatus,
            tossWinnerId: data.toss_winner_id,
            tossChoice: data.toss_choice as 'bat' | 'bowl' | undefined,
            currentInnings: data.current_innings as 1 | 2,
            totalOvers: data.total_overs,
            winnerId: data.winner_id,
            mvpId: data.mvp_id,
            // Include the joined data with proper type handling
            team1: data.team1 ? { name: data.team1.name } : undefined,
            team2: data.team2 ? { name: data.team2.name } : undefined,
            winner: data.winner ? { name: data.winner.name } : undefined,
            mvp: data.mvp ? { name: data.mvp.name } : undefined,
          };
          
          setMatch(matchData);
          
          // Also fetch innings data if it's a live or completed match
          if (data.status === 'live' || data.status === 'completed') {
            const { data: inningsData, error: inningsError } = await supabase
              .from('innings')
              .select('*')
              .eq('match_id', matchId)
              .order('innings_number');
              
            if (inningsError) {
              console.error('Error fetching innings:', inningsError);
            } else if (inningsData && inningsData.length > 0) {
              // Map innings data to our Match type
              const updatedMatchData = { ...matchData };
              
              inningsData.forEach(innings => {
                if (innings.innings_number === 1) {
                  updatedMatchData.innings1 = {
                    teamId: innings.team_id,
                    runs: innings.runs || 0,
                    wickets: innings.wickets || 0,
                    overs: innings.overs || 0,
                    extras: innings.extras || 0,
                    battingOrder: [],
                    bowlerId: '',
                  };
                } else if (innings.innings_number === 2) {
                  updatedMatchData.innings2 = {
                    teamId: innings.team_id,
                    runs: innings.runs || 0,
                    wickets: innings.wickets || 0,
                    overs: innings.overs || 0,
                    extras: innings.extras || 0,
                    battingOrder: [],
                    bowlerId: '',
                  };
                }
              });
              
              setMatch(updatedMatchData);
            }
          }
          
          // Get full team data
          const team1Data = teams.find(t => t.id === data.team1_id) || null;
          const team2Data = teams.find(t => t.id === data.team2_id) || null;
          const winnerData = data.winner_id ? teams.find(t => t.id === data.winner_id) : null;
          
          setTeam1(team1Data);
          setTeam2(team2Data);
          setWinner(winnerData);
          
          // Get MVP data
          if (data.mvp_id) {
            const allPlayers = teams.flatMap(team => team.players || []);
            const mvpData = allPlayers.find(p => p.id === data.mvp_id) || null;
            setMvp(mvpData);
          }
        }
      } catch (error) {
        console.error('Error in fetchMatchDetails:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMatchDetails();
  }, [matchId, teams]);
  
  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cricket-accent"></div>
        </div>
      </MainLayout>
    );
  }
  
  if (!match || !team1 || !team2) {
    return (
      <MainLayout>
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold text-red-600">Match not found</h2>
          <p className="text-gray-500 mt-2">The match you're looking for doesn't exist or has been removed.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate('/matches')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Matches
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-4 flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <Badge 
          variant={match?.status === 'live' ? 'default' : match?.status === 'completed' ? 'secondary' : 'outline'}
          className={cn(
            match?.status === 'live' && "animate-pulse bg-red-500",
            match?.status === 'completed' && "bg-green-500"
          )}
        >
          {match?.status.toUpperCase()}
        </Badge>
      </div>
      
      <Card className="mb-6 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-cricket-primary/10 to-cricket-secondary/10">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">
                {team1.name} vs {team2.name}
              </CardTitle>
              <CardDescription className="flex items-center mt-2">
                <CalendarIcon className="h-4 w-4 mr-1" />
                {format(new Date(match.date), 'PPP')}
                <span className="mx-2">•</span>
                <MapPinIcon className="h-4 w-4 mr-1" />
                {match.venue}
                {match.totalOvers && (
                  <>
                    <span className="mx-2">•</span>
                    <Clock className="h-4 w-4 mr-1" />
                    {match.totalOvers} overs
                  </>
                )}
              </CardDescription>
            </div>
            
            {match.status === 'completed' && winner && (
              <div className="flex items-center bg-green-50 p-3 rounded-lg border border-green-100">
                <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                <div>
                  <div className="font-semibold text-green-800">{winner.name} won</div>
                  {mvp && (
                    <div className="text-xs text-green-600">MVP: {mvp.name}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {match.status === 'upcoming' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Match Details</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Date:</div>
                    <div>{format(new Date(match.date), 'PPP')}</div>
                    
                    <div className="text-muted-foreground">Venue:</div>
                    <div>{match.venue}</div>
                    
                    <div className="text-muted-foreground">Format:</div>
                    <div>{match.totalOvers} overs</div>
                    
                    {match.tossWinnerId && (
                      <>
                        <div className="text-muted-foreground">Toss:</div>
                        <div>
                          {match.tossWinnerId === team1.id ? team1.name : team2.name} won and chose to {match.tossChoice}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold">Teams</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-lg p-3">
                      <div className="font-medium mb-2">{team1.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {team1.players?.length || 0} players
                      </div>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="font-medium mb-2">{team2.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {team2.players?.length || 0} players
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {match.status === 'live' && (
            <div className="p-6">
              <LiveMatchWrapper match={match} teams={teams} />
            </div>
          )}
          
          {match.status === 'completed' && (
            <div className="p-6">
              <Tabs defaultValue="summary">
                <TabsList className="mb-4">
                  <TabsTrigger value="summary">Match Summary</TabsTrigger>
                  <TabsTrigger value="scorecard">Scorecard</TabsTrigger>
                </TabsList>
                
                <TabsContent value="summary">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {match.innings1 && (
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">
                              {teams.find(t => t.id === match.innings1?.teamId)?.name} - 1st Innings
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold">
                              {match.innings1.runs}/{match.innings1.wickets}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {match.innings1.overs} overs
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      
                      {match.innings2 && (
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">
                              {teams.find(t => t.id === match.innings2?.teamId)?.name} - 2nd Innings
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold">
                              {match.innings2.runs}/{match.innings2.wickets}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {match.innings2.overs} overs
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <h3 className="font-semibold text-green-800 mb-2">Result</h3>
                      <p>
                        {winner?.name} won by {
                          match.winnerId === team2.id && match.innings2
                            ? `${10 - match.innings2.wickets} wickets`
                            : match.innings1 && match.innings2
                              ? `${match.innings1.runs - match.innings2.runs} runs`
                              : 'default'
                        }
                      </p>
                      {mvp && (
                        <div className="mt-2 text-sm">
                          <span className="text-muted-foreground">Player of the Match:</span> {mvp.name}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="scorecard">
                  <div className="space-y-6">
                    <div className="text-sm text-muted-foreground italic">
                      Detailed scorecard will be available soon.
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Team Lineups</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-cricket-primary" />
                {team1.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {team1.players?.map(player => (
                  <div key={player.id} className="flex justify-between items-center p-2 hover:bg-muted rounded-md">
                    <div>{player.name}</div>
                    <Badge variant="outline">{player.role}</Badge>
                  </div>
                ))}
                {(!team1.players || team1.players.length === 0) && (
                  <div className="text-center text-muted-foreground p-4">
                    No players available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-cricket-secondary" />
                {team2.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {team2.players?.map(player => (
                  <div key={player.id} className="flex justify-between items-center p-2 hover:bg-muted rounded-md">
                    <div>{player.name}</div>
                    <Badge variant="outline">{player.role}</Badge>
                  </div>
                ))}
                {(!team2.players || team2.players.length === 0) && (
                  <div className="text-center text-muted-foreground p-4">
                    No players available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default MatchDetails;
