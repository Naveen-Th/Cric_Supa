
import { useState, useEffect } from 'react';
import { useCricket } from '@/context/CricketContext';
import MainLayout from '@/components/layout/MainLayout';
import MatchCard from '@/components/MatchCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { mockMatches } from '@/data/mockData';

const Matches = () => {
  const { matches, teams, loading } = useCricket();
  const [error, setError] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
  
  // Use actual data or mockData if no matches are found
  const displayMatches = matches.length > 0 ? matches : mockMatches;
  
  // Filter matches by status
  const upcomingMatches = displayMatches.filter(match => match.status === 'upcoming');
  const liveMatches = displayMatches.filter(match => match.status === 'live');
  const completedMatches = displayMatches.filter(match => match.status === 'completed');
  
  // Simulate data loading check
  useEffect(() => {
    // If global loading is complete but we have no matches, check if we should use mock data
    if (!loading) {
      if (matches.length === 0) {
        console.log('No matches found from database, using mock data');
        setUsingMockData(true);
        // Still show a non-critical warning
        setError('Could not connect to the database. Showing sample match data for demonstration.');
      }
      setLocalLoading(false);
    }
  }, [loading, matches]);

  // Render loading state
  if (loading || localLoading) {
    return (
      <MainLayout>
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Cricket Matches</h1>
          <p className="text-gray-500">View all cricket matches</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-cricket-primary animate-spin" />
            <p className="text-cricket-primary font-medium">Loading matches...</p>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Cricket Matches</h1>
        <p className="text-gray-500">View all cricket matches</p>
      </div>

      {error && (
        <Alert variant="default" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Issues</AlertTitle>
          <AlertDescription className="flex items-center gap-2">
            {error}
            {usingMockData && <WifiOff className="h-4 w-4 text-orange-500" />}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4 w-full">
          <TabsTrigger value="all" className="flex-1">All Matches ({displayMatches.length})</TabsTrigger>
          <TabsTrigger value="live" className="flex-1">Live ({liveMatches.length})</TabsTrigger>
          <TabsTrigger value="upcoming" className="flex-1">Upcoming ({upcomingMatches.length})</TabsTrigger>
          <TabsTrigger value="completed" className="flex-1">Completed ({completedMatches.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayMatches.length === 0 && (
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
