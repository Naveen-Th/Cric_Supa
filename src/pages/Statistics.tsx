
import React from 'react';
import { useCricket } from '@/context/CricketContext';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

const Statistics = () => {
  const { teams, players, matches, completedMatches } = useCricket();

  // Prepare runs per over data for completed matches
  const runsPerOverData = completedMatches.flatMap(match => {
    if (!match.innings1 || !match.innings2) return [];
    
    // Create data points for all overs in first innings
    const firstInningsData = Array.from({ length: Math.ceil(match.innings1.overs) }, (_, i) => ({
      over: i + 1,
      team: teams.find(t => t.id === match.innings1?.teamId)?.name || 'Unknown',
      runs: Math.floor(Math.random() * 15), // Simulated data for visualization
    }));
    
    // Create data points for all overs in second innings
    const secondInningsData = Array.from({ length: Math.ceil(match.innings2.overs) }, (_, i) => ({
      over: i + 1,
      team: teams.find(t => t.id === match.innings2?.teamId)?.name || 'Unknown',
      runs: Math.floor(Math.random() * 15), // Simulated data for visualization
    }));
    
    return [...firstInningsData, ...secondInningsData];
  });

  // Calculate aggregate player statistics
  const playerStats = players.map(player => {
    const totalRuns = player.battingStats?.runs || 0;
    const totalWickets = player.bowlingStats?.wickets || 0;
    const matchesPlayed = completedMatches.filter(match => 
      (match.innings1?.battingOrder?.includes(player.id) || 
       match.innings2?.battingOrder?.includes(player.id))
    ).length;
    
    const strikeRate = player.battingStats?.ballsFaced 
      ? (player.battingStats.runs / player.battingStats.ballsFaced) * 100 
      : 0;
    
    const economyRate = player.bowlingStats?.overs 
      ? player.bowlingStats.runs / player.bowlingStats.overs 
      : 0;
    
    return {
      id: player.id,
      name: player.name,
      team: teams.find(t => t.id === player.teamId)?.name || 'Unknown',
      totalRuns,
      totalWickets,
      matchesPlayed,
      strikeRate: strikeRate.toFixed(2),
      economyRate: economyRate.toFixed(2),
    };
  });

  // Calculate team statistics
  const teamStats = teams.map(team => {
    const teamMatches = completedMatches.filter(match => 
      match.team1Id === team.id || match.team2Id === team.id
    );
    
    const wins = teamMatches.filter(match => match.winnerId === team.id).length;
    const losses = teamMatches.length - wins;
    
    // Calculate average and max scores
    const scores = teamMatches.flatMap(match => {
      const scores = [];
      if (match.innings1 && match.innings1.teamId === team.id) {
        scores.push(match.innings1.runs);
      }
      if (match.innings2 && match.innings2.teamId === team.id) {
        scores.push(match.innings2.runs);
      }
      return scores;
    });
    
    const avgScore = scores.length > 0 
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) 
      : 0;
    
    const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
    
    return {
      id: team.id,
      name: team.name,
      matches: teamMatches.length,
      wins,
      losses,
      winRatio: teamMatches.length > 0 ? (wins / teamMatches.length).toFixed(2) : '0.00',
      avgScore,
      maxScore,
    };
  });

  // Prepare fall of wickets data (simulated for visualization)
  const wicketsData = Array.from({ length: 10 }, (_, i) => ({
    wicket: i + 1,
    over: Math.floor(Math.random() * 20) + 1,
    runs: Math.floor(Math.random() * 150) + 20,
  }));

  // Color palette for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Cricket Statistics</h1>
        <p className="text-gray-500">Comprehensive statistics for teams and players</p>
      </div>

      <Tabs defaultValue="match" className="w-full">
        <TabsList className="mb-4 w-full">
          <TabsTrigger value="match" className="flex-1">Match Statistics</TabsTrigger>
          <TabsTrigger value="player" className="flex-1">Player Statistics</TabsTrigger>
          <TabsTrigger value="team" className="flex-1">Team Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="match">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Runs per Over Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Runs per Over</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={runsPerOverData.slice(0, 20)} // Limit for better visualization
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="over" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="runs" fill="#8884d8" name="Runs Scored" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Fall of Wickets Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Fall of Wickets</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={wicketsData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="wicket" label={{ value: 'Wicket Number', position: 'insideBottomRight', offset: -5 }} />
                    <YAxis yAxisId="left" label={{ value: 'Runs', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Over', angle: 90, position: 'insideRight' }} />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="runs" stroke="#8884d8" name="Runs at Fall" />
                    <Line yAxisId="right" type="monotone" dataKey="over" stroke="#82ca9d" name="Over Number" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Over Economy Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Bowling Economy Rate</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={players
                      .filter(p => p.bowlingStats && p.bowlingStats.overs > 0)
                      .map(p => ({
                        name: p.name,
                        economy: p.bowlingStats?.overs ? (p.bowlingStats.runs / p.bowlingStats.overs).toFixed(2) : 0,
                        wickets: p.bowlingStats?.wickets || 0,
                      }))
                      .slice(0, 10)
                    }
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="economy" fill="#82ca9d" name="Economy Rate" />
                    <Bar dataKey="wickets" fill="#8884d8" name="Wickets" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="player">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Run Scorers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Run Scorers</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={playerStats
                      .sort((a, b) => b.totalRuns - a.totalRuns)
                      .slice(0, 10)
                    }
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalRuns" fill="#8884d8" name="Total Runs" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Wicket Takers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Wicket Takers</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={playerStats
                      .sort((a, b) => b.totalWickets - a.totalWickets)
                      .slice(0, 10)
                    }
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalWickets" fill="#82ca9d" name="Total Wickets" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Strike Rate Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Batting Strike Rate</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={playerStats
                      .filter(p => parseFloat(p.strikeRate) > 0)
                      .sort((a, b) => parseFloat(b.strikeRate) - parseFloat(a.strikeRate))
                      .slice(0, 10)
                    }
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="strikeRate" fill="#ff8042" name="Strike Rate" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Economy Rate Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Economy Rate</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={playerStats
                      .filter(p => parseFloat(p.economyRate) > 0)
                      .sort((a, b) => parseFloat(a.economyRate) - parseFloat(b.economyRate))
                      .slice(0, 10)
                    }
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="economyRate" fill="#ffbb28" name="Economy Rate" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="team">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Win/Loss Ratio */}
            <Card>
              <CardHeader>
                <CardTitle>Team Performance</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={teamStats.filter(t => t.matches > 0)}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="wins" stackId="a" fill="#82ca9d" name="Wins" />
                    <Bar dataKey="losses" stackId="a" fill="#ff8042" name="Losses" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Win Ratio Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Win Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={teamStats
                        .filter(t => t.wins > 0)
                        .map(team => ({ name: team.name, value: team.wins }))
                      }
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {teamStats.filter(t => t.wins > 0).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Average Score Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Average Team Score</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={teamStats.filter(t => t.avgScore > 0)}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgScore" fill="#8884d8" name="Average Score" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Maximum Score Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Highest Team Score</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={teamStats.filter(t => t.maxScore > 0)}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="maxScore" fill="#82ca9d" name="Highest Score" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default Statistics;
