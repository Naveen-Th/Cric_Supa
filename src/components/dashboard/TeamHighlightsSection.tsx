
import { useNavigate } from 'react-router-dom';
import { Trophy, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TeamStatsCard from '@/components/TeamStatsCard';
import { Team } from '@/types/cricket';

interface TeamHighlightsSectionProps {
  topTeams: Team[];
  activeTeams: Team[];
}

const TeamHighlightsSection = ({ topTeams, activeTeams }: TeamHighlightsSectionProps) => {
  const navigate = useNavigate();
  
  return (
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
  );
};

export default TeamHighlightsSection;
