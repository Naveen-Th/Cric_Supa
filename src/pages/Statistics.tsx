
import { useState } from 'react';
import { useCricket } from '@/context/CricketContext';
import MainLayout from '@/components/layout/MainLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Loader2 } from 'lucide-react';

// Color constants for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Statistics = () => {
  const { teams, players, matches, completedMatches } = useCricket();
  const [selectedTeam, setSelectedTeam] = useState<string | null>(teams.length > 0 ? teams[0].id : null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Selected team data
  const team = teams.find(t => t.id === selectedTeam);
  const teamPlayers = team ? team.players : [];
  
  // Calculate batting statistics
  const battingStats = teamPlayers
    .filter(player => player.battingStats)
    .map(player => ({
      name: player.name,
      runs: player.battingStats?.runs || 0,
      avg: player.battingStats?.ballsFaced ? 
        ((player.battingStats.runs / player.battingStats.ballsFaced) * 100).toFixed(2) : 0,
      fours: player.battingStats?.fours || 0,
      sixes: player.battingStats?.sixes || 0,
    }))
    .sort((a, b) => b.runs - a.runs);
  
  // Calculate bowling statistics
  const bowlingStats = teamPlayers
    .filter(player => player.bowlingStats)
    .map(player => ({
      name: player.name,
      wickets: player.bowlingStats?.wickets || 0,
      runs: player.bowlingStats?.runs || 0,
      overs: player.bowlingStats?.overs || 0,
      economy: player.bowlingStats?.overs ? 
        (player.bowlingStats.runs / player.bowlingStats.overs).toFixed(2) : 0,
    }))
    .sort((a, b) => b.wickets - a.wickets);
  
  // Calculate team wins/losses
  const teamMatches = completedMatches.filter(
    match => match.team1Id === selectedTeam || match.team2Id === selectedTeam
  );
  
  const wins = teamMatches.filter(match => match.winnerId === selectedTeam).length;
  const losses = teamMatches.length - wins;
  
  const winLossData = [
    { name: 'Wins', value: wins },
    { name: 'Losses', value: losses },
  ];
  
  // Role distribution in the team
  const roleDistribution = teamPlayers.reduce((acc, player) => {
    acc[player.role] = (acc[player.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const roleData = Object.entries(roleDistribution).map(([name, value]) => ({ name, value }));
  
  // Loading and error states
  if (teams.length === 0) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-cricket-secondary mb-4" />
          <p className="text-gray-500">Loading statistics...</p>
        </div>
      </MainLayout>
    );
  }
  
  if (!selectedTeam) {
    return (
      <MainLayout>
        <div className="text-center p-10">
          <h2 className="text-xl font-semibold mb-2">No teams available</h2>
          <p className="text-gray-500">Statistics cannot be displayed without team data.</p>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-6">Team Statistics</h1>
      
      <div className="mb-6 max-w-xs">
        <Select 
          value={selectedTeam} 
          onValueChange={(value) => {
            setIsLoading(true);
            setSelectedTeam(value);
            // Simulate loading
            setTimeout(() => setIsLoading(false), 500);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a team" />
          </SelectTrigger>
          <SelectContent>
            {teams.map(team => (
              <SelectItem key={team.id} value={team.id}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-cricket-secondary mb-4" />
          <p className="text-gray-500">Loading statistics...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {team && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Team Performance</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {wins + losses > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={winLossData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {winLossData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No match data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Player Roles</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {roleData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={roleData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {roleData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No player data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          
          <Tabs defaultValue="batting">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="batting" className="flex-1">Batting Statistics</TabsTrigger>
              <TabsTrigger value="bowling" className="flex-1">Bowling Statistics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="batting">
              <Card>
                <CardHeader>
                  <CardTitle>Top Batsmen</CardTitle>
                </CardHeader>
                <CardContent className="h-[400px]">
                  {battingStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={battingStats.slice(0, 5)}
                        margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                      >
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="runs" fill="#8884d8" name="Runs" />
                        <Bar dataKey="fours" fill="#82ca9d" name="Fours" />
                        <Bar dataKey="sixes" fill="#ffc658" name="Sixes" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No batting statistics available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="bowling">
              <Card>
                <CardHeader>
                  <CardTitle>Top Bowlers</CardTitle>
                </CardHeader>
                <CardContent className="h-[400px]">
                  {bowlingStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={bowlingStats.slice(0, 5)}
                        margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                      >
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="wickets" fill="#8884d8" name="Wickets" />
                        <Bar dataKey="overs" fill="#82ca9d" name="Overs" />
                        <Bar dataKey="economy" fill="#ffc658" name="Economy" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No bowling statistics available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </MainLayout>
  );
};

export default Statistics;
