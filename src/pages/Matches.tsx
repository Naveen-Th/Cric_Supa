
import { useState, useEffect } from 'react';
import { useCricket } from '@/context/CricketContext';
import MainLayout from '@/components/layout/MainLayout';
import MatchCard from '@/components/MatchCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Matches = () => {
  const { matches, teams, loading } = useCricket();
  const [error, setError] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(true);
  
  // Filter matches by status
  const upcomingMatches = matches.filter(match => match.status === 'upcoming');
  const liveMatches = matches.filter(match => match.status === 'live');
  const completedMatches = matches.filter(match => match.status === 'completed');
  
  // Simulate data loading check
  useEffect(() => {
    // If global loading is complete but we have no matches, wait a bit and set error
    if (!loading && matches.length === 0) {
      const timer = setTimeout(() => {
        if (matches.length === 0) {
          setError('No match data available. Please try again later.');
        }
        setLocalLoading(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    } else if (!loading) {
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

  // Render error state
  if (error) {
    return (
      <MainLayout>
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Cricket Matches</h1>
          <p className="text-gray-500">View all cricket matches</p>
        </div>
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="p-8 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-500">No matches available. Check back later!</p>
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

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4 w-full">
          <TabsTrigger value="all" className="flex-1">All Matches ({matches.length})</TabsTrigger>
          <TabsTrigger value="live" className="flex-1">Live ({liveMatches.length})</TabsTrigger>
          <TabsTrigger value="upcoming" className="flex-1">Upcoming ({upcomingMatches.length})</TabsTrigger>
          <TabsTrigger value="completed" className="flex-1">Completed ({completedMatches.length})</TabsTrigger>
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
