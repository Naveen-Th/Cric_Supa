
import { useCricket } from '@/context/CricketContext';
import MainLayout from '@/components/layout/MainLayout';
import LiveMatch from '@/components/LiveMatch';
import TeamCard from '@/components/TeamCard';
import MatchCard from '@/components/MatchCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Dashboard = () => {
  const { liveMatch, activeTeams, completedMatches, teams } = useCricket();
  
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
            <LiveMatch match={liveMatch} teams={teams} />
          </div>
        ) : (
          <div className="mb-8 p-6 bg-gray-50 rounded-lg text-center">
            <h2 className="text-xl font-semibold text-gray-600">No Live Matches</h2>
            <p className="text-gray-500 mt-2">Check back later for live cricket action!</p>
          </div>
        )}
        
        {/* Teams and Matches Tabs */}
        <Tabs defaultValue="teams" className="w-full">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="teams" className="flex-1">Active Teams</TabsTrigger>
            <TabsTrigger value="matches" className="flex-1">Completed Matches</TabsTrigger>
          </TabsList>
          
          <TabsContent value="teams">
            <h2 className="text-xl font-bold mb-4">Active Teams</h2>
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
            <h2 className="text-xl font-bold mb-4">Completed Matches</h2>
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
