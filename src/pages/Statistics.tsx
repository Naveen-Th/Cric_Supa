
import { useState } from 'react';
import { useCricket } from '@/context/CricketContext';
import MainLayout from '@/components/layout/MainLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Loader2, Users2, BarChart2 } from 'lucide-react';
import StatisticsTable from '@/components/StatisticsTable';

// Color constants for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Statistics = () => {
  const { teams, players, matches, completedMatches, loading } = useCricket();
  const [selectedTeam, setSelectedTeam] = useState<string | null>(teams.length > 0 ? teams[0].id : null);
  const [loadingTeamData, setLoadingTeamData] = useState(false);
  
  // Selected team data
  const team = teams.find(t => t.id === selectedTeam);
  const teamPlayers = team ? team.players : [];
  
  // Filter players for batting and bowling statistics
  const batsmen = teamPlayers.filter(p => p.battingStats && p.battingStats.runs > 0);
  const bowlers = teamPlayers.filter(p => p.bowlingStats && p.bowlingStats.wickets > 0);
  
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
  
  // Empty state - no teams or data
  const NoTeamsOrData = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-10">
      <div className="mb-6 text-gray-300">
        <BarChart2 size={100} />
      </div>
      <h3 className="text-2xl font-medium mb-2">No Statistics Available</h3>
      <p className="text-gray-500 max-w-md">
        There is currently no statistical data available. Statistics will appear here once teams are created and matches are played.
      </p>
    </div>
  );
  
  // Loading and error states
  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-cricket-secondary mb-4" />
          <p className="text-gray-500">Loading statistics...</p>
        </div>
      </MainLayout>
    );
  }
  
  if (teams.length === 0) {
    return (
      <MainLayout>
        <h1 className="text-2xl font-bold mb-6">Team Statistics</h1>
        <NoTeamsOrData />
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
            setLoadingTeamData(true);
            setSelectedTeam(value);
            // Simulate loading
            setTimeout(() => setLoadingTeamData(false), 500);
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
      
      {loadingTeamData ? (
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
              <StatisticsTable 
                title="Top Batsmen" 
                players={batsmen} 
                type="batting"
                loading={loadingTeamData}
              />
            </TabsContent>
            
            <TabsContent value="bowling">
              <StatisticsTable 
                title="Top Bowlers" 
                players={bowlers} 
                type="bowling"
                loading={loadingTeamData}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </MainLayout>
  );
};

export default Statistics;
