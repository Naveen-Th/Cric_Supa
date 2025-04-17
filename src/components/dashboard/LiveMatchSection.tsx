
import { useCricket } from '@/context/CricketContext';
import LiveMatchWrapper from '@/components/LiveMatchWrapper';
import LiveMatchChart from '@/components/LiveMatchChart';
import { Team, Match } from '@/types/cricket';

interface LiveMatchSectionProps {
  liveMatch: Match;
  teams: Team[];
}

const LiveMatchSection = ({ liveMatch, teams }: LiveMatchSectionProps) => {
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
