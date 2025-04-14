
import { useCricket } from '@/context/CricketContext';
import MainLayout from '@/components/layout/MainLayout';
import TeamCard from '@/components/TeamCard';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const Teams = () => {
  const { teams } = useCricket();
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
  
  // Empty state
  const NoTeamsFound = () => (
    <div className="text-center p-10 bg-gray-50 rounded-lg w-full">
      <h3 className="text-xl font-medium mb-2">No teams found</h3>
      <p className="text-gray-500">
        {searchTerm ? 'Try a different search term' : 'No teams are available at the moment'}
      </p>
    </div>
  );
  
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Teams</h1>
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
        
        {teams.length === 0 ? (
          <TeamsLoadingSkeleton />
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
