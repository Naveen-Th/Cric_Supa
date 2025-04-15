import { Team, Player } from '@/types/cricket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Award, 
  TrendingUp, 
  Users, 
  Activity,
  Target,
  Trophy
} from 'lucide-react';

interface TeamStatsCardProps {
  team: Team;
}

const TeamStatsCard = ({ team }: TeamStatsCardProps) => {
  // Calculate team statistics
  const totalPlayers = team.players?.length || 0;
  
  // Top batsman
  const topBatsman = team.players
    ?.filter(p => p.battingStats && p.battingStats.runs > 0)
    .sort((a, b) => (b.battingStats?.runs || 0) - (a.battingStats?.runs || 0))[0];
    
  // Top bowler  
  const topBowler = team.players
    ?.filter(p => p.bowlingStats && p.bowlingStats.wickets > 0)
    .sort((a, b) => (b.bowlingStats?.wickets || 0) - (a.bowlingStats?.wickets || 0))[0];
    
  // Team runs
  const teamTotalRuns = team.players?.reduce((total, player) => {
    return total + (player.battingStats?.runs || 0);
  }, 0);
  
  // Team wickets
  const teamTotalWickets = team.players?.reduce((total, player) => {
    return total + (player.bowlingStats?.wickets || 0);
  }, 0);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span className="truncate">{team.name}</span>
          <Badge variant={team.status === 'active' ? 'default' : 'outline'}>
            {team.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Team stats */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span>{totalPlayers} Players</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-gray-400" />
              <span>{teamTotalRuns || 0} Runs</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-gray-400" />
              <span>{teamTotalWickets || 0} Wickets</span>
            </div>
          </div>
          
          {/* Top performers */}
          <div className="space-y-3 border-t pt-3">
            {topBatsman && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium">Top Batsman</span>
                </div>
                <div className="text-sm pl-6">
                  {topBatsman.name} - {topBatsman.battingStats?.runs || 0} runs
                </div>
              </div>
            )}
            
            {topBowler && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium">Top Bowler</span>
                </div>
                <div className="text-sm pl-6">
                  {topBowler.name} - {topBowler.bowlingStats?.wickets || 0} wickets
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamStatsCard;
