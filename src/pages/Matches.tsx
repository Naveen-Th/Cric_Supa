
import { useCricket } from '@/context/CricketContext';
import MainLayout from '@/components/layout/MainLayout';
import MatchCard from '@/components/MatchCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Matches = () => {
  const { matches, teams } = useCricket();
  
  // Filter matches by status
  const upcomingMatches = matches.filter(match => match.status === 'upcoming');
  const liveMatches = matches.filter(match => match.status === 'live');
  const completedMatches = matches.filter(match => match.status === 'completed');
  
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Cricket Matches</h1>
        <p className="text-gray-500">View all cricket matches</p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4 w-full">
          <TabsTrigger value="all" className="flex-1">All Matches</TabsTrigger>
          <TabsTrigger value="live" className="flex-1">Live</TabsTrigger>
          <TabsTrigger value="upcoming" className="flex-1">Upcoming</TabsTrigger>
          <TabsTrigger value="completed" className="flex-1">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.length === 0 && (
              <div className="col-span-full text-center p-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No matches available.</p>
              </div>
            )}
            {liveMatches.map(match => (
              <MatchCard key={match.id} match={match} teams={teams} />
            ))}
            {upcomingMatches.map(match => (
              <MatchCard key={match.id} match={match} teams={teams} />
            ))}
            {completedMatches.map(match => (
              <MatchCard key={match.id} match={match} teams={teams} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="live">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveMatches.length === 0 && (
              <div className="col-span-full text-center p-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No live matches at the moment.</p>
              </div>
            )}
            {liveMatches.map(match => (
              <MatchCard key={match.id} match={match} teams={teams} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="upcoming">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingMatches.length === 0 && (
              <div className="col-span-full text-center p-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No upcoming matches scheduled.</p>
              </div>
            )}
            {upcomingMatches.map(match => (
              <MatchCard key={match.id} match={match} teams={teams} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="completed">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedMatches.length === 0 && (
              <div className="col-span-full text-center p-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No completed matches available.</p>
              </div>
            )}
            {completedMatches.map(match => (
              <MatchCard key={match.id} match={match} teams={teams} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default Matches;
