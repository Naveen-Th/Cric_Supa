
import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MatchCard from '@/components/MatchCard';
import { Match, Team } from '@/types/cricket';

interface UpcomingMatchesSectionProps {
  upcomingMatches: Match[];
  teams: Team[];
}

const UpcomingMatchesSection = ({ upcomingMatches, teams }: UpcomingMatchesSectionProps) => {
  const navigate = useNavigate();
  
  return (
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
  );
};

export default UpcomingMatchesSection;
