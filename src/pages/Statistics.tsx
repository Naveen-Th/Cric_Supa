
import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Player, Match } from '@/types/cricket';
import { useCricket } from '@/context/CricketContext';
import { FileSpreadsheet, MedalIcon, PieChart, BarChart, Activity, Target, BarChart2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as ReBarChart, Bar, Legend, ScatterChart, Scatter, Cell } from 'recharts';

const Statistics = () => {
  const { teams, players, matches, loading } = useCricket();
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedMatch, setSelectedMatch] = useState<string>('all');
  const [selectedView, setSelectedView] = useState<string>('players');
  
  const completedMatches = matches.filter(match => match.status === 'completed');
  
  const filteredPlayers = selectedTeam === 'all'
    ? players
    : players.filter(player => player.teamId === selectedTeam);

  const topBatsmen = filteredPlayers
    .filter(p => p.battingStats && p.battingStats.runs > 0)
    .sort((a, b) => (b.battingStats?.runs || 0) - (a.battingStats?.runs || 0))
    .slice(0, 5);
    
  const topBowlers = filteredPlayers
    .filter(p => p.bowlingStats && p.bowlingStats.wickets > 0)
    .sort((a, b) => (b.bowlingStats?.wickets || 0) - (a.bowlingStats?.wickets || 0))
    .slice(0, 5);
  
  // Generate match analysis data
  const selectedMatchData = selectedMatch !== 'all' 
    ? matches.find(m => m.id === selectedMatch) 
    : null;
  
  // Generate team comparison data for all teams
  const teamComparisonData = teams
    .filter(team => team.status === 'active')
    .map(team => {
      const teamMatches = matches.filter(
        m => (m.team1Id === team.id || m.team2Id === team.id) && m.status === 'completed'
      );
      
      const totalRuns = teamMatches.reduce((sum, match) => {
        if (match.team1Id === team.id && match.innings1) {
          return sum + (match.innings1.runs || 0);
        } else if (match.team2Id === team.id && match.innings2) {
          return sum + (match.innings2.runs || 0);
        }
        return sum;
      }, 0);
      
      const totalWickets = teamMatches.reduce((sum, match) => {
        if (match.team1Id === team.id && match.innings1) {
          return sum + (match.innings1.wickets || 0);
        } else if (match.team2Id === team.id && match.innings2) {
          return sum + (match.innings2.wickets || 0);
        }
        return sum;
      }, 0);
      
      const wins = teamMatches.filter(m => m.winnerId === team.id).length;
      
      return {
        name: team.name,
        matches: teamMatches.length,
        runs: totalRuns,
        wickets: totalWickets,
        wins
      };
    });
  
  // Generate match-by-match data for selected team
  const teamMatchData = selectedTeam !== 'all' ? 
    matches
      .filter(m => (m.team1Id === selectedTeam || m.team2Id === selectedTeam) && m.status === 'completed')
      .map(match => {
        const isTeam1 = match.team1Id === selectedTeam;
        const teamRuns = isTeam1 && match.innings1 ? match.innings1.runs : 
                        !isTeam1 && match.innings2 ? match.innings2.runs : 0;
        const opponentRuns = !isTeam1 && match.innings1 ? match.innings1.runs : 
                            isTeam1 && match.innings2 ? match.innings2.runs : 0;
        const teamWickets = isTeam1 && match.innings1 ? match.innings1.wickets : 
                            !isTeam1 && match.innings2 ? match.innings2.wickets : 0;
        const teamOvers = isTeam1 && match.innings1 ? match.innings1.overs : 
                          !isTeam1 && match.innings2 ? match.innings2.overs : 0;
                          
        return {
          matchId: match.id,
          opponent: isTeam1 ? match.team2Id : match.team1Id,
          opponentName: teams.find(t => t.id === (isTeam1 ? match.team2Id : match.team1Id))?.name || 'Unknown',
          teamRuns: teamRuns || 0,
          opponentRuns: opponentRuns || 0,
          teamWickets: teamWickets || 0,
          teamOvers: teamOvers || 0,
          result: match.winnerId === selectedTeam ? 'win' : match.winnerId ? 'loss' : 'tie',
          date: match.date
        };
      }) : [];
      
  // Sample data for Wagon Wheel chart (would typically come from ball-by-ball data)
  const wagonWheelData = [
    { direction: 0, runs: 12, color: '#8884d8' },
    { direction: 45, runs: 18, color: '#82ca9d' },
    { direction: 90, runs: 24, color: '#ffc658' },
    { direction: 135, runs: 8, color: '#ff8042' },
    { direction: 180, runs: 15, color: '#0088fe' },
    { direction: 225, runs: 10, color: '#00C49F' },
    { direction: 270, runs: 22, color: '#FFBB28' },
    { direction: 315, runs: 14, color: '#FF8042' },
  ];
  
  // Sample data for Manhattan chart (runs per over with wickets)
  const createManhattanData = (match: Match | null) => {
    if (!match || !match.innings1 || !match.innings2) return [];
    
    // In a real app, this would come from ball-by-ball data
    // This is just sample data based on the match total runs
    const totalOvers = Math.max(match.innings1.overs || 0, match.innings2.overs || 0);
    const data = [];
    
    let team1RunsPerOver = match.innings1.runs ? Math.ceil(match.innings1.runs / (match.innings1.overs || 1)) : 0;
    let team2RunsPerOver = match.innings2.runs ? Math.ceil(match.innings2.runs / (match.innings2.overs || 1)) : 0;
    
    for (let i = 1; i <= totalOvers; i++) {
      // Randomize runs slightly for visualization
      const team1Runs = Math.max(0, team1RunsPerOver + Math.floor(Math.random() * 5) - 2);
      const team2Runs = Math.max(0, team2RunsPerOver + Math.floor(Math.random() * 5) - 2);
      
      data.push({
        over: i,
        [teams.find(t => t.id === match.team1Id)?.name || 'Team 1']: team1Runs,
        [teams.find(t => t.id === match.team2Id)?.name || 'Team 2']: team2Runs,
        // Wicket markers would be added here in a real application
      });
    }
    
    return data;
  };
  
  const manhattanData = selectedMatchData ? createManhattanData(selectedMatchData) : [];
  
  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cricket-accent"></div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Cricket Statistics</h1>
        <p className="text-muted-foreground">View comprehensive player and team statistics across all matches.</p>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Statistics View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Tabs value={selectedView} onValueChange={setSelectedView} className="w-full">
              <TabsList className="mb-4 w-full">
                <TabsTrigger value="players" className="flex-1">
                  <MedalIcon className="mr-2 h-4 w-4" />
                  Players
                </TabsTrigger>
                <TabsTrigger value="teams" className="flex-1">
                  <BarChart className="mr-2 h-4 w-4" />
                  Teams
                </TabsTrigger>
                <TabsTrigger value="matches" className="flex-1">
                  <Activity className="mr-2 h-4 w-4" />
                  Match Analysis
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            {selectedView === 'players' && (
              <Select onValueChange={setSelectedTeam} defaultValue={selectedTeam}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {teams.map(team => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {selectedView === 'matches' && (
              <Select onValueChange={setSelectedMatch} defaultValue={selectedMatch}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a match" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Matches</SelectItem>
                  {completedMatches.map(match => (
                    <SelectItem key={match.id} value={match.id}>
                      {teams.find(t => t.id === match.team1Id)?.name} vs {teams.find(t => t.id === match.team2Id)?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {selectedView === 'teams' && selectedTeam !== 'all' && (
              <Button 
                variant="outline" 
                onClick={() => setSelectedTeam('all')}
                className="w-full sm:w-auto"
              >
                Reset Team Filter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Player Statistics */}
      {selectedView === 'players' && (
        <Tabs defaultValue="batting" className="w-full">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="batting" className="flex-1">
              <MedalIcon className="mr-2 h-4 w-4" />
              Top Batsmen
            </TabsTrigger>
            <TabsTrigger value="bowling" className="flex-1">
              <PieChart className="mr-2 h-4 w-4" />
              Top Bowlers
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="batting">
            <Card>
              <CardHeader>
                <CardTitle>Top Batsmen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Team
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Runs
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Balls Faced
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          4s
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          6s
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {topBatsmen.map(player => (
                        <tr key={player.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {player.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {teams.find(team => team.id === player.teamId)?.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {player.battingStats?.runs}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {player.battingStats?.ballsFaced}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {player.battingStats?.fours}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {player.battingStats?.sixes}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Batting comparison chart */}
                <div className="mt-6 h-80">
                  <h3 className="font-medium mb-4">Runs Comparison</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topBatsmen.map(player => ({
                        name: player.name,
                        runs: player.battingStats?.runs || 0,
                        team: teams.find(team => team.id === player.teamId)?.name
                      }))}
                      margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" />
                      <YAxis />
                      <Tooltip formatter={(value, name) => [value, name === 'runs' ? 'Runs' : name]} />
                      <Legend />
                      <Bar dataKey="runs" fill="#8884d8" name="Runs" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bowling">
            <Card>
              <CardHeader>
                <CardTitle>Top Bowlers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Team
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Wickets
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Runs
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Overs
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {topBowlers.map(player => (
                        <tr key={player.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {player.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {teams.find(team => team.id === player.teamId)?.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {player.bowlingStats?.wickets}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {player.bowlingStats?.runs}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {player.bowlingStats?.overs}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Bowling comparison chart */}
                <div className="mt-6 h-80">
                  <h3 className="font-medium mb-4">Wickets Comparison</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topBowlers.map(player => ({
                        name: player.name,
                        wickets: player.bowlingStats?.wickets || 0,
                        economy: player.bowlingStats ? 
                          (player.bowlingStats.runs / (player.bowlingStats.overs || 1)).toFixed(2) : 0,
                        team: teams.find(team => team.id === player.teamId)?.name
                      }))}
                      margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="wickets" fill="#82ca9d" name="Wickets" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
      
      {/* Team Statistics */}
      {selectedView === 'teams' && (
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart2 className="mr-2 h-5 w-5" />
                Team Performance Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={teamComparisonData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="runs" fill="#8884d8" name="Total Runs" />
                    <Bar dataKey="wickets" fill="#82ca9d" name="Total Wickets" />
                    <Bar dataKey="wins" fill="#ffc658" name="Wins" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* If a team is selected, show match-by-match performance */}
          {selectedTeam !== 'all' && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {teams.find(t => t.id === selectedTeam)?.name} Match Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={teamMatchData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="opponentName" 
                        angle={-45} 
                        textAnchor="end"
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="teamRuns" 
                        name={`${teams.find(t => t.id === selectedTeam)?.name} Runs`}
                        stroke="#8884d8" 
                        fill="#8884d8" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="opponentRuns" 
                        name="Opponent Runs"
                        stroke="#82ca9d" 
                        fill="#82ca9d" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      
      {/* Match Analysis */}
      {selectedView === 'matches' && selectedMatch !== 'all' && selectedMatchData && (
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>
                Manhattan Chart - Runs per Over
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={manhattanData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="over" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {Object.keys(manhattanData[0] || {})
                      .filter(key => key !== 'over')
                      .map((key, index) => (
                        <Bar 
                          key={key} 
                          dataKey={key} 
                          fill={index === 0 ? "#8884d8" : "#82ca9d"} 
                        />
                      ))
                    }
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2 h-5 w-5" />
                Wagon Wheel - Shot Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name="direction" 
                      domain={[-100, 100]} 
                      tick={false}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name="distance"
                      domain={[-100, 100]} 
                      tick={false}
                    />
                    <Tooltip 
                      formatter={(value, name, props) => [
                        `${props.payload.runs} runs`, 
                        name === 'x' ? 'Direction' : 'Distance'
                      ]} 
                    />
                    <Scatter 
                      name="Shots" 
                      data={wagonWheelData.map(item => ({
                        x: Math.cos((item.direction * Math.PI) / 180) * item.runs * 3,
                        y: Math.sin((item.direction * Math.PI) / 180) * item.runs * 3,
                        runs: item.runs,
                        direction: item.direction
                      }))} 
                      fill="#8884d8"
                    >
                      {wagonWheelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center text-sm text-gray-500 mt-2">
                The wagon wheel shows shot distribution around the field. 
                Longer lines indicate more runs scored in that direction.
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {selectedView === 'matches' && selectedMatch === 'all' && (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-500">Please select a specific match to view detailed analytics.</p>
          </CardContent>
        </Card>
      )}
    </MainLayout>
  );
};

export default Statistics;
