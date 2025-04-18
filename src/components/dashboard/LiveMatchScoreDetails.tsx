
import { Match, Team } from '@/types/cricket';
import TeamScoreCard from './TeamScoreCard';

interface LiveMatchScoreDetailsProps {
  match: Match;
  team1: Team;
  team2: Team;
}

const LiveMatchScoreDetails = ({ match, team1, team2 }: LiveMatchScoreDetailsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <TeamScoreCard 
        match={match} 
        team={team1} 
        innings={1}
        battingPlayers={team1.players || []}
      />
      {match.currentInnings === 2 && (
        <TeamScoreCard 
          match={match} 
          team={team2} 
          innings={2}
          battingPlayers={team2.players || []}
        />
      )}
    </div>
  );
};

export default LiveMatchScoreDetails;
