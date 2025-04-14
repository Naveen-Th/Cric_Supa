
import { useCricket } from '@/context/CricketContext';
import { Match, Team } from '@/types/cricket';
import LiveMatch from './LiveMatch';
import LiveMatchControl from './admin/LiveMatchControl';

interface LiveMatchWrapperProps {
  match: Match;
  teams: Team[];
  isAdmin?: boolean;
}

const LiveMatchWrapper = ({ match, teams, isAdmin = false }: LiveMatchWrapperProps) => {
  return (
    <div className="space-y-6">
      <LiveMatch match={match} teams={teams} />
      
      {isAdmin && (
        <LiveMatchControl match={match} teams={teams} />
      )}
    </div>
  );
};

export default LiveMatchWrapper;
