
import { useParams } from 'react-router-dom';
import { useCricket } from '@/context/CricketContext';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarIcon, MapPin, Trophy } from 'lucide-react';

const MatchDetails = () => {
  const { matchId } = useParams();
  const { matches, teams, players } = useCricket();
  
  const match = matches.find(match => match.id === matchId);
  
  if (!match) {
    return (
      <MainLayout>
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Match Not Found</h2>
          <p>The match you're looking for doesn't exist or has been removed.</p>
        </div>
      </MainLayout>
    );
  }
  
  if (match.status === 'live') {
    // Redirect to live match on dashboard
    window.location.href = '/';
    return null;
  }
  
  const team1 = teams.find(team => team.id === match.team1Id);
  const team2 = teams.find(team => team.id === match.team2Id);
  
  const winnerTeam = match.winnerId 
    ? teams.find(team => team.id === match.winnerId) 
    : undefined;
  
  const mvpPlayer = match.mvpId 
    ? players.find(player => player.id === match.mvpId)
    : undefined;
  
  if (!team1 || !team2) {
    return (
      <MainLayout>
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Match Data Error</h2>
          <p>There was an error loading the match data.</p>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="bg-gradient-to-r from-cricket-pitch to-cricket-pitch-dark text-white">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{team1.name} vs {team2.name}</CardTitle>
                <div className="text-white/80 text-sm mt-2 flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {new Date(match.date).toLocaleDateString()}
                </div>
                <div className="text-white/80 text-sm mt-1 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {match.venue}
                </div>
              </div>
              <Badge variant="outline" className="bg-white/20 text-white">
                {match.status.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {match.status === 'completed' && (
              <div className="mb-6">
                <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center">
                  <div className="flex items-center mb-2">
                    <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                    <span className="font-bold text-lg">Match Result</span>
                  </div>
                  
                  {winnerTeam && (
                    <div className="text-center mb-2">
                      <div className="font-medium">{winnerTeam.name} won by</div>
                      <div className="text-sm">
                        {match.innings1 && match.innings2 && match.winnerId === match.team2Id
                          ? `${10 - match.innings2.wickets} wickets`
                          : `${match.innings1?.runs! - match.innings2?.runs!} runs`
                        }
                      </div>
                    </div>
                  )}
                  
                  {mvpPlayer && (
                    <div className="text-center mt-2">
                      <div className="text-sm text-gray-500">Player of the Match</div>
                      <div className="font-medium">{mvpPlayer.name}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-center mb-2 font-medium">{team1.name}</div>
                {match.innings1 && match.innings1.teamId === team1.id && (
                  <div className="text-center text-2xl font-bold">
                    {match.innings1.runs}/{match.innings1.wickets}
                    <span className="text-sm text-gray-500 ml-2">
                      ({match.innings1.overs} overs)
                    </span>
                  </div>
                )}
                {match.innings2 && match.innings2.teamId === team1.id && (
                  <div className="text-center text-2xl font-bold">
                    {match.innings2.runs}/{match.innings2.wickets}
                    <span className="text-sm text-gray-500 ml-2">
                      ({match.innings2.overs} overs)
                    </span>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-center mb-2 font-medium">{team2.name}</div>
                {match.innings1 && match.innings1.teamId === team2.id && (
                  <div className="text-center text-2xl font-bold">
                    {match.innings1.runs}/{match.innings1.wickets}
                    <span className="text-sm text-gray-500 ml-2">
                      ({match.innings1.overs} overs)
                    </span>
                  </div>
                )}
                {match.innings2 && match.innings2.teamId === team2.id && (
                  <div className="text-center text-2xl font-bold">
                    {match.innings2.runs}/{match.innings2.wickets}
                    <span className="text-sm text-gray-500 ml-2">
                      ({match.innings2.overs} overs)
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {match.tossWinnerId && match.tossChoice && (
              <div className="text-sm text-center mb-4">
                <span className="font-medium">
                  {teams.find(t => t.id === match.tossWinnerId)?.name}
                </span>{' '}
                won the toss and elected to{' '}
                <span className="font-medium">{match.tossChoice}</span> first
              </div>
            )}
          </CardContent>
        </Card>
        
        {match.status === 'completed' && (
          <Tabs defaultValue="innings1" className="w-full">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="innings1" className="flex-1">1st Innings</TabsTrigger>
              <TabsTrigger value="innings2" className="flex-1">2nd Innings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="innings1">
              {match.innings1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {teams.find(t => t.id === match.innings1?.teamId)?.name} - Batting
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* In a real app, we would display the full scorecard here */}
                    <div className="text-center p-4">
                      <p className="text-gray-500">
                        Detailed scorecard would be shown here in the full app.
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        Including batting order, individual scores, and bowling figures.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="innings2">
              {match.innings2 && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {teams.find(t => t.id === match.innings2?.teamId)?.name} - Batting
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* In a real app, we would display the full scorecard here */}
                    <div className="text-center p-4">
                      <p className="text-gray-500">
                        Detailed scorecard would be shown here in the full app.
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        Including batting order, individual scores, and bowling figures.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </MainLayout>
  );
};

export default MatchDetails;
