
import { Match, Team } from '@/types/cricket';
import LiveMatchWrapper from '@/components/LiveMatchWrapper';
import LiveMatchChart from '@/components/LiveMatchChart';
import LiveMatchLoading from './LiveMatchLoading';
import LiveMatchError from './LiveMatchError';
import LiveMatchHeader from './LiveMatchHeader';
import LiveMatchScoreDetails from './LiveMatchScoreDetails';
import FallOfWickets from './FallOfWickets';

interface LiveMatchSectionProps {
  liveMatch: Match;
  teams: Team[];
  isLoading?: boolean;
}

const LiveMatchSection = ({ liveMatch, teams, isLoading = false }: LiveMatchSectionProps) => {
  if (isLoading) {
    return <LiveMatchLoading />;
  }
  
  const team1 = teams.find(team => team.id === liveMatch.team1Id);
  const team2 = teams.find(team => team.id === liveMatch.team2Id);
  
  if (!team1 || !team2) {
    return <LiveMatchError />;
  }
  
  return (
    <div className="mb-8">
      <LiveMatchHeader />
      
      <div className="grid grid-cols-1 gap-6">
        <LiveMatchWrapper match={liveMatch} teams={teams} />
        <LiveMatchScoreDetails match={liveMatch} team1={team1} team2={team2} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LiveMatchChart match={liveMatch} teams={teams} />
          <FallOfWickets match={liveMatch} teams={teams} />
        </div>
      </div>
    </div>
  );
};

export default LiveMatchSection;
