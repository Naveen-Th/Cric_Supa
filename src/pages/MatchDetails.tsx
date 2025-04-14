import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCricket } from '@/context/CricketContext';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, MapPin, Trophy, Users, ArrowLeft, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { Match, Team } from '@/types/cricket';

const MatchDetails = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const { matches, teams, players } = useCricket();
  const navigate = useNavigate();
  
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get match from local state or fetch it
  useEffect(() => {
    const fetchMatch = async () => {
      setLoading(true);
      
      try {
        // First try to get from local state
        let matchData = matches.find(m => m.id === matchId);
        
        if (!matchData) {
          // If not found, try to fetch from Supabase
          const { data, error } = await supabase
            .from('matches')
            .select('*, team1:team1_id(name), team2:team2_id(name), winner:winner_id(name), mvp:mvp_id(name), innings(*)')
            .eq('id', matchId)
            .single();
          
          if (error) throw error;
          
          if (data) {
            // Transform Supabase data to match our Match type
            const innings1 = data.innings?.find((i: any) => i.innings_number === 1);
            const innings2 = data.innings?.find((i: any) => i.innings_number === 2);
            
            matchData = {
              id: data.id,
              team1Id: data.team1_id,
              team2Id: data.team2_id,
              date: data.date,
              venue: data.venue,
              status: data.status as 'upcoming' | 'live' | 'completed',
              tossWinnerId: data.toss_winner_id,
              tossChoice: data.toss_choice as 'bat' | 'bowl' | undefined,
              currentInnings: data.current_innings as 1 | 2,
              totalOvers: data.total_overs,
              winnerId: data.winner_id,
              mvpId: data.mvp_id,
              innings1: innings1 ? {
                teamId: innings1.team_id,
                runs: innings1.runs,
                wickets: innings1.wickets,
                overs: innings1.overs,
                battingOrder: [],
                extras: innings1.extras,
              } : undefined,
              innings2: innings2 ? {
                teamId: innings2.team_id,
                runs: innings2.runs,
                wickets: innings2.wickets,
                overs: innings2.overs,
                battingOrder: [],
                extras: innings2.extras,
              } : undefined,
              // Keep the additional properties from Supabase for display
              team1: { name: data.team1?.name || 'Team 1' },
              team2: { name: data.team2?.name || 'Team 2' },
              winner: data.winner ? { name: data.winner.name } : undefined,
              mvp: data.mvp ? { name: data.mvp.name } : undefined
            };
          }
        }
        
        setMatch(matchData);
      } catch (err) {
        console.error('Error fetching match:', err);
        setError('Failed to load match details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMatch();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('match-details')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'matches', filter: `id=eq.${matchId}` },
        (payload) => {
          console.log('Match updated:', payload);
          // Transform the payload.new into our Match type
          if (payload.new) {
            const newData = payload.new as any;
            setMatch(prevMatch => {
              if (!prevMatch) return null;
              
              return {
                ...prevMatch,
                id: newData.id,
                team1Id: newData.team1_id,
                team2Id: newData.team2_id,
                date: newData.date,
                venue: newData.venue,
                status: newData.status as 'upcoming' | 'live' | 'completed',
                tossWinnerId: newData.toss_winner_id,
                tossChoice: newData.toss_choice as 'bat' | 'bowl' | undefined,
                currentInnings: newData.current_innings as 1 | 2,
                totalOvers: newData.total_overs,
                winnerId: newData.winner_id,
                mvpId: newData.mvp_id,
              };
            });
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [matchId, matches]);
  
  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-cricket-secondary mb-4" />
          <p className="text-gray-500">Loading match details...</p>
        </div>
      </MainLayout>
    );
  }
  
  if (error || !match) {
    return (
      <MainLayout>
        <div className="text-center p-10">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-gray-500">{error || 'Match not found'}</p>
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
  
  // Find teams from the local state for more details
  const team1Data = teams.find(t => t.id === match.team1Id);
  const team2Data = teams.find(t => t.id === match.team2Id);
  
  // Create properly structured team objects, ensuring they have a players array
  const team1: Team = team1Data || { 
    id: match.team1Id, 
    name: match.team1?.name || 'Team 1',
    status: 'active',
    players: []
  };
  
  const team2: Team = team2Data || { 
    id: match.team2Id, 
    name: match.team2?.name || 'Team 2',
    status: 'active',
    players: []
  };
  
  // Get MVP if exists
  const mvp = players.find(p => p.id === match.mvpId) || (match.mvp && { name: match.mvp.name });
  
  // Get status badge
  const getStatusBadge = () => {
    switch (match.status) {
      case 'live':
        return (
          <Badge className="bg-cricket-ball text-white">
            LIVE
          </Badge>
        );
      case 'upcoming':
        return (
          <Badge className="bg-cricket-secondary text-white">
            UPCOMING
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline">
            COMPLETED
          </Badge>
        );
    }
  };
  
  return (
    <MainLayout>
      <div className="mb-6 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/matches')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">{team1.name} vs {team2.name}</h1>
        <div className="ml-4">{getStatusBadge()}</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <CalendarIcon className="h-5 w-5 text-cricket-secondary mr-2" />
              <span className="font-medium">Date</span>
            </div>
            <p>{new Date(match.date).toLocaleDateString()}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <MapPin className="h-5 w-5 text-cricket-secondary mr-2" />
              <span className="font-medium">Venue</span>
            </div>
            <p>{match.venue}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Trophy className="h-5 w-5 text-cricket-secondary mr-2" />
              <span className="font-medium">Format</span>
            </div>
            <p>{match.totalOvers} overs match</p>
          </CardContent>
        </Card>
      </div>
      
      {match.status === 'completed' && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Match Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="col-span-2">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">{team1.name}</h3>
                    <p className="text-2xl font-bold mt-2">
                      {match.innings1?.runs || 0}/{match.innings1?.wickets || 0}
                    </p>
                    <p className="text-sm text-gray-500">
                      ({match.innings1?.overs || 0} overs)
                    </p>
                  </div>
                  
                  <div className="flex justify-center items-center">
                    <div className="text-center">
                      <span className="text-sm text-gray-500">vs</span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">{team2.name}</h3>
                    <p className="text-2xl font-bold mt-2">
                      {match.innings2?.runs || 0}/{match.innings2?.wickets || 0}
                    </p>
                    <p className="text-sm text-gray-500">
                      ({match.innings2?.overs || 0} overs)
                    </p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="text-center py-2">
                  {match.winnerId && (
                    <div>
                      <p className="font-medium text-lg">
                        {match.winnerId === match.team1Id ? team1.name : team2.name} won by{' '}
                        {match.winnerId === match.team2Id && match.innings2
                          ? `${10 - match.innings2.wickets} wickets`
                          : `${(match.innings1?.runs || 0) - (match.innings2?.runs || 0)} runs`
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4 flex items-center">
                  <Trophy className="h-5 w-5 text-amber-500 mr-2" />
                  Player of the Match
                </h3>
                
                {mvp ? (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-lg">{mvp.name}</p>
                    <p className="text-sm text-gray-500">
                      {teams.find(t => t.players?.some(p => p.id === match.mvpId))?.name || ''}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">Not awarded</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {match.status === 'upcoming' && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Match Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-4">Toss</h3>
                {match.tossWinnerId ? (
                  <p>
                    {match.tossWinnerId === match.team1Id ? team1.name : team2.name} won the toss and elected to {match.tossChoice}
                  </p>
                ) : (
                  <p className="text-gray-500">Toss yet to happen</p>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Teams</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">{team1.name}</p>
                    <p className="text-sm text-gray-500">{team1.players?.length || 0} players</p>
                  </div>
                  <div>
                    <p className="font-medium">{team2.name}</p>
                    <p className="text-sm text-gray-500">{team2.players?.length || 0} players</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {match.status === 'live' && (
        <div className="text-center p-6 bg-cricket-pitch/10 rounded-lg mb-8">
          <p className="text-lg font-medium mb-2">This match is currently live!</p>
          <Button onClick={() => navigate('/')}>
            Watch Live
          </Button>
        </div>
      )}
      
      <Tabs defaultValue="teams">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="teams" className="flex-1">
            <Users className="h-4 w-4 mr-2" />
            Teams
          </TabsTrigger>
          <TabsTrigger value="details" className="flex-1">
            <Trophy className="h-4 w-4 mr-2" />
            Match Details
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="teams">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{team1.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {team1.players && team1.players.length > 0 ? (
                  <ul className="space-y-2">
                    {team1.players.map((player) => (
                      <li key={player.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                        <span>{player.name}</span>
                        <Badge variant="outline">{player.role}</Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-center py-4">Player information not available</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{team2.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {team2.players && team2.players.length > 0 ? (
                  <ul className="space-y-2">
                    {team2.players.map((player) => (
                      <li key={player.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                        <span>{player.name}</span>
                        <Badge variant="outline">{player.role}</Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-center py-4">Player information not available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Match Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Match Conditions</h3>
                    <p className="text-gray-600">Format: {match.totalOvers} overs per side</p>
                    <p className="text-gray-600">Venue: {match.venue}</p>
                    <p className="text-gray-600">Date: {new Date(match.date).toLocaleDateString()}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Match Status</h3>
                    <p className="text-gray-600">Current Status: {match.status}</p>
                    {match.status === 'live' && (
                      <p className="text-gray-600">
                        Current Innings: {match.currentInnings === 1 ? 'First' : 'Second'}
                      </p>
                    )}
                  </div>
                </div>
                
                {match.status === 'completed' && match.winnerId && (
                  <div>
                    <h3 className="font-semibold mb-2">Result</h3>
                    <p className="text-gray-600">
                      Winner: {match.winnerId === match.team1Id ? team1.name : team2.name}
                    </p>
                    {mvp && (
                      <p className="text-gray-600">
                        Player of the Match: {mvp.name}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default MatchDetails;
