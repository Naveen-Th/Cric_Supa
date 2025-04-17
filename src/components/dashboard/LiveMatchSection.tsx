
import { Match, Team } from '@/types/cricket';
import LiveMatchWrapper from '@/components/LiveMatchWrapper';
import LiveMatchChart from '@/components/LiveMatchChart';
import { Loader2 } from 'lucide-react';

interface LiveMatchSectionProps {
  liveMatch: Match;
  teams: Team[];
  isLoading?: boolean;
}

const LiveMatchSection = ({ liveMatch, teams, isLoading = false }: LiveMatchSectionProps) => {
  if (isLoading) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <span className="h-3 w-3 rounded-full bg-cricket-ball mr-2 animate-pulse"></span>
          Live Match
        </h2>
        <div className="flex justify-center items-center h-48 bg-gray-50 rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-cricket-primary animate-spin" />
            <p className="text-cricket-primary font-medium">Loading match data...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <span className="h-3 w-3 rounded-full bg-cricket-ball mr-2 animate-pulse"></span>
        Live Match
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="lg:col-span-1">
          <LiveMatchWrapper match={liveMatch} teams={teams} />
        </div>
        
        <div className="lg:col-span-1">
          <LiveMatchChart match={liveMatch} teams={teams} />
        </div>
      </div>
    </div>
  );
};

export default LiveMatchSection;
