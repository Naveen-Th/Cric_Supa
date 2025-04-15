import { useCricket } from '@/context/CricketContext';
import MainLayout from '@/components/layout/MainLayout';
import LiveMatchWrapper from '@/components/LiveMatchWrapper';
import TeamCard from '@/components/TeamCard';
import TeamStatsCard from '@/components/TeamStatsCard';
import MatchCard from '@/components/MatchCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowRight, Trophy, Users, Calendar, BarChart4 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import StatisticsTable from '@/components/StatisticsTable';

const Dashboard = () => {
  const { liveMatch, activeTeams, matches, teams, players } = useCricket();
  const navigate = useNavigate();
  
  // Get upcoming matches (not live, not completed)
  const upcomingMatches = matches.filter(match => match.status === 'upcoming');
  const completedMatches = matches.filter(match => match.status === 'completed');
  
  // Get top teams (those with most completed matches won)
  const topTeams = activeTeams.slice(0, 3);
  
  // Get top batsmen and bowlers across all teams
  const topBatsmen = players
    .filter(p => p.battingStats && p.battingStats.runs > 0)
    .sort((a, b) => (b.battingStats?.runs || 0) - (a.battingStats?.runs || 0))
    .slice(0, 5);
    
  const topBowlers = players
    .filter(p => p.bowlingStats && p.bowlingStats.wickets > 0)
    .sort((a, b) => (b.bowlingStats?.wickets || 0) - (a.bowlingStats?.wickets || 0))
    .slice(0, 5);
  
  return (
    <MainLayout>
      <div className="grid grid-cols-1 gap-6">
        
        {/* Live Match Section */}
        {liveMatch ? (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <span className="h-3 w-3 rounded-full bg-cricket-ball mr-2 animate-pulse"></span>
              Live Match
            </h2>
            <LiveMatchWrapper match={liveMatch} teams={teams} />
          </div>
        ) : (
          <div className="mb-8 p-6 bg-gray-50 rounded-lg text-center">
            <h2 className="text-xl font-semibold text-gray-600">No Live Matches</h2>
            <p className="text-gray-500 mt-2">Check back later for live cricket action!</p>
          </div>
        )}
        
        {/* Player Statistics Summary */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <BarChart4 className="mr-2 h-5 w-5 text-cricket-secondary" />
              Player Statistics
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center"
              onClick={() => navigate('/statistics')}
            >
              View all stats <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatisticsTable 
              title="Top Batsmen" 
              players={topBatsmen} 
              type="batting"
            />
            <StatisticsTable 
              title="Top Bowlers" 
              players={topBowlers} 
              type="bowling"
            />
          </div>
        </div>
        
        {/* Upcoming Matches Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-cricket-secondary" />
              Upcoming Matches
            </h2>
            {upcomingMatches.length > 3 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center"
                onClick={() => navigate('/matches')}
              >
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
          
          {upcomingMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingMatches.slice(0, 3).map(match => (
                <MatchCard key={match.id} match={match} teams={teams} />
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No upcoming matches scheduled.</p>
            </div>
          )}
        </div>
        
        {/* Team Highlights */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <Trophy className="mr-2 h-5 w-5 text-cricket-accent" />
              Team Highlights
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center"
              onClick={() => navigate('/teams')}
            >
              All teams <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          
          {activeTeams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topTeams.map(team => (
                <TeamStatsCard key={team.id} team={team} />
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No active teams available.</p>
            </div>
          )}
        </div>
        
        {/* Teams and Completed Matches Tabs */}
        <Tabs defaultValue="teams" className="w-full">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="teams" className="flex-1">
              <Users className="mr-2 h-4 w-4" />
              Active Teams
            </TabsTrigger>
            <TabsTrigger value="matches" className="flex-1">
              <Trophy className="mr-2 h-4 w-4" />
              Completed Matches
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="teams">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeTeams.map(team => (
                <TeamCard key={team.id} team={team} />
              ))}
              {activeTeams.length === 0 && (
                <div className="col-span-full text-center p-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No active teams available.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="matches">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedMatches.map(match => (
                <MatchCard key={match.id} match={match} teams={teams} />
              ))}
              {completedMatches.length === 0 && (
                <div className="col-span-full text-center p-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No completed matches available.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
