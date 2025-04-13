
import { Match, Team } from '@/types/cricket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, MapPin } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  teams: Team[];
}

const MatchCard = ({ match, teams }: MatchCardProps) => {
  const navigate = useNavigate();
  
  const team1 = teams.find(team => team.id === match.team1Id);
  const team2 = teams.find(team => team.id === match.team2Id);
  
  if (!team1 || !team2) {
    return null;
  }
  
  const getStatusBadge = () => {
    switch (match.status) {
      case 'live':
        return (
          <Badge className="bg-cricket-ball text-white">
            LIVE
          </Badge>
        );
      case 'upcoming':
        return (
          <Badge className="bg-cricket-secondary text-white">
            UPCOMING
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline">
            COMPLETED
          </Badge>
        );
    }
  };
  
  const getMatchResult = () => {
    if (match.status !== 'completed' || !match.winnerId) {
      return null;
    }
    
    const winnerTeam = teams.find(team => team.id === match.winnerId);
    
    if (!winnerTeam) {
      return null;
    }
    
    return (
      <div className="mt-2 text-sm font-medium">
        {winnerTeam.name} won by{' '}
        {match.innings1 && match.innings2 && match.winnerId === match.team2Id
          ? `${10 - match.innings2.wickets} wickets`
          : `${match.innings1?.runs! - match.innings2?.runs!} runs`
        }
      </div>
    );
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-center mb-2">
          <CardTitle className="text-lg">{team1.name} vs {team2.name}</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <CalendarIcon className="h-4 w-4 mr-2" />
          {new Date(match.date).toLocaleDateString()}
        </div>
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <MapPin className="h-4 w-4 mr-2" />
          {match.venue}
        </div>
        
        {match.status === 'completed' && (
          <div className="mb-4 p-3 bg-gray-50 rounded border">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-left font-medium">{team1.name}</div>
              <div className="text-center">vs</div>
              <div className="text-right font-medium">{team2.name}</div>
              <div className="text-left">
                {match.innings1?.runs || 0}/{match.innings1?.wickets || 0}
                <span className="text-xs text-gray-500 ml-1">
                  ({match.innings1?.overs || 0})
                </span>
              </div>
              <div className="text-center"></div>
              <div className="text-right">
                {match.innings2?.runs || 0}/{match.innings2?.wickets || 0}
                <span className="text-xs text-gray-500 ml-1">
                  ({match.innings2?.overs || 0})
                </span>
              </div>
            </div>
            {getMatchResult()}
          </div>
        )}
        
        {match.status === 'upcoming' && (
          <div className="mb-4 p-3 bg-gray-50 rounded border">
            <div className="text-center text-sm">
              <div className="font-medium mb-1">Match Details</div>
              <div>Format: {match.totalOvers} overs</div>
            </div>
          </div>
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => navigate(
            match.status === 'live' 
              ? '/' 
              : `/matches/${match.id}`
          )}
        >
          {match.status === 'live' ? 'Watch Live' : 'View Details'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MatchCard;
