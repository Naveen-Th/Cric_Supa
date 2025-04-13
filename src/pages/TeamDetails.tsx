
import { useParams } from 'react-router-dom';
import { useCricket } from '@/context/CricketContext';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TeamDetails = () => {
  const { teamId } = useParams();
  const { teams } = useCricket();
  
  const team = teams.find(team => team.id === teamId);
  
  if (!team) {
    return (
      <MainLayout>
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Team Not Found</h2>
          <p>The team you're looking for doesn't exist or has been removed.</p>
        </div>
      </MainLayout>
    );
  }
  
  const batsmen = team.players.filter(p => p.role === 'Batsman');
  const bowlers = team.players.filter(p => p.role === 'Bowler');
  const allRounders = team.players.filter(p => p.role === 'All-Rounder');
  const wicketKeepers = team.players.filter(p => p.role === 'Wicket Keeper');
  
  return (
    <MainLayout>
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="bg-gradient-to-r from-cricket-pitch to-cricket-pitch-dark text-white">
            <div className="flex justify-between items-center">
              <CardTitle>{team.name}</CardTitle>
              <Badge variant="outline" className="bg-white/20 text-white">
                {team.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-sm text-gray-500">Players</div>
                <div className="text-xl font-bold">{team.players.length}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-sm text-gray-500">Batsmen</div>
                <div className="text-xl font-bold">{batsmen.length}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-sm text-gray-500">Bowlers</div>
                <div className="text-xl font-bold">{bowlers.length}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-sm text-gray-500">All-Rounders</div>
                <div className="text-xl font-bold">{allRounders.length + wicketKeepers.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="all" className="flex-1">All Players</TabsTrigger>
            <TabsTrigger value="batting" className="flex-1">Batting Stats</TabsTrigger>
            <TabsTrigger value="bowling" className="flex-1">Bowling Stats</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Team Roster</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {team.players.map(player => (
                      <TableRow key={player.id}>
                        <TableCell className="font-medium">{player.name}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              player.role === 'Batsman' 
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : player.role === 'Bowler'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-purple-50 text-purple-700 border-purple-200'
                            }
                          >
                            {player.role}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="batting">
            <Card>
              <CardHeader>
                <CardTitle>Batting Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Runs</TableHead>
                      <TableHead>Balls</TableHead>
                      <TableHead>SR</TableHead>
                      <TableHead>4s</TableHead>
                      <TableHead>6s</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {team.players
                      .filter(player => player.battingStats)
                      .sort((a, b) => (b.battingStats?.runs || 0) - (a.battingStats?.runs || 0))
                      .map(player => (
                        <TableRow key={player.id}>
                          <TableCell className="font-medium">{player.name}</TableCell>
                          <TableCell>{player.battingStats?.runs || 0}</TableCell>
                          <TableCell>{player.battingStats?.ballsFaced || 0}</TableCell>
                          <TableCell>
                            {player.battingStats?.ballsFaced 
                              ? ((player.battingStats.runs / player.battingStats.ballsFaced) * 100).toFixed(2)
                              : '0.00'
                            }
                          </TableCell>
                          <TableCell>{player.battingStats?.fours || 0}</TableCell>
                          <TableCell>{player.battingStats?.sixes || 0}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bowling">
            <Card>
              <CardHeader>
                <CardTitle>Bowling Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Overs</TableHead>
                      <TableHead>Maidens</TableHead>
                      <TableHead>Runs</TableHead>
                      <TableHead>Wickets</TableHead>
                      <TableHead>Economy</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {team.players
                      .filter(player => player.bowlingStats && player.bowlingStats.overs > 0)
                      .sort((a, b) => (b.bowlingStats?.wickets || 0) - (a.bowlingStats?.wickets || 0))
                      .map(player => (
                        <TableRow key={player.id}>
                          <TableCell className="font-medium">{player.name}</TableCell>
                          <TableCell>{player.bowlingStats?.overs || 0}</TableCell>
                          <TableCell>{player.bowlingStats?.maidens || 0}</TableCell>
                          <TableCell>{player.bowlingStats?.runs || 0}</TableCell>
                          <TableCell>{player.bowlingStats?.wickets || 0}</TableCell>
                          <TableCell>
                            {player.bowlingStats?.overs 
                              ? (player.bowlingStats.runs / player.bowlingStats.overs).toFixed(2)
                              : '0.00'
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default TeamDetails;
