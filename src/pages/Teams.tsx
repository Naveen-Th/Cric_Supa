
import { useCricket } from '@/context/CricketContext';
import MainLayout from '@/components/layout/MainLayout';
import TeamCard from '@/components/TeamCard';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Users2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const Teams = () => {
  const { teams, loading } = useCricket();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter teams based on search term
  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Loading state - skeleton cards
  const TeamsLoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array(6).fill(0).map((_, i) => (
        <Skeleton key={i} className="h-[250px] w-full rounded-lg" />
      ))}
    </div>
  );
  
  // Empty state - no teams found
  const NoTeamsFound = () => (
    <div className="text-center p-10 bg-gray-50 rounded-lg w-full">
      <h3 className="text-xl font-medium mb-2">No teams found</h3>
      <p className="text-gray-500">
        {searchTerm ? 'Try a different search term' : 'No teams are available at the moment'}
      </p>
    </div>
  );
  
  // Empty state - no teams in database
  const NoTeamsInDatabase = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-10">
      <div className="mb-6 text-gray-300">
        <Users2 size={100} />
      </div>
      <h3 className="text-2xl font-medium mb-2">No Teams Yet</h3>
      <p className="text-gray-500 max-w-md">
        There are currently no teams in the database. Teams will appear here once they are created by an administrator.
      </p>
    </div>
  );
  
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Teams</h1>
        
        {teams.length > 0 && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        )}
        
        {loading ? (
          <TeamsLoadingSkeleton />
        ) : teams.length === 0 ? (
          <NoTeamsInDatabase />
        ) : filteredTeams.length === 0 ? (
          <NoTeamsFound />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map(team => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Teams;
