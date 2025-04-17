
import { Button } from '@/components/ui/button';
import { PlayCircle, Calendar, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCricket } from '@/context/CricketContext';
import { Match, Team } from '@/types/cricket';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface NoLiveMatchSectionProps {
  upcomingMatchCount?: number;
}

const NoLiveMatchSection = ({ upcomingMatchCount = 0 }: NoLiveMatchSectionProps) => {
  const navigate = useNavigate();
  const { completedMatches, teams } = useCricket();
  
  // Get most recent completed match
  const recentMatch = completedMatches.length > 0 
    ? completedMatches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] 
    : null;
    
  const team1 = recentMatch ? teams.find(t => t.id === recentMatch.team1Id) : null;
  const team2 = recentMatch ? teams.find(t => t.id === recentMatch.team2Id) : null;
  const winner = recentMatch?.winnerId ? teams.find(t => t.id === recentMatch.winnerId) : null;
  
  return (
    <div className="mb-8 p-6 bg-gray-50 rounded-lg">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-600">No Live Matches</h2>
        <p className="text-gray-500 mt-2 mb-4">Check back later for live cricket action!</p>
        
        {recentMatch && team1 && team2 && winner && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <h3 className="text-lg font-semibold">Recent Match Result</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-2 items-center mb-3">
                <div className="text-right font-medium">{team1.name}</div>
                <div className="text-center">vs</div>
                <div className="text-left font-medium">{team2.name}</div>
                
                <div className="text-right">
                  {recentMatch.innings1?.runs || 0}/{recentMatch.innings1?.wickets || 0}
                  <span className="text-xs text-gray-500 ml-1">
                    ({recentMatch.innings1?.overs || 0})
                  </span>
                </div>
                <div className="text-center"></div>
                <div className="text-left">
                  {recentMatch.innings2?.runs || 0}/{recentMatch.innings2?.wickets || 0}
                  <span className="text-xs text-gray-500 ml-1">
                    ({recentMatch.innings2?.overs || 0})
                  </span>
                </div>
              </div>
              
              <div className="flex justify-center mb-2">
                <Badge className="bg-cricket-secondary text-white">
                  {winner.name} won by {recentMatch.innings1 && recentMatch.innings2 && recentMatch.winnerId === recentMatch.team2Id
                    ? `${10 - (recentMatch.innings2.wickets || 0)} wickets`
                    : `${(recentMatch.innings1?.runs || 0) - (recentMatch.innings2?.runs || 0)} runs`
                  }
                </Badge>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2"
                onClick={() => navigate(`/matches/${recentMatch.id}`)}
              >
                View Match Details
              </Button>
            </CardContent>
          </Card>
        )}
        
        <div className="flex justify-center gap-3 mt-4">
          {upcomingMatchCount > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/matches')}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              View {upcomingMatchCount} upcoming {upcomingMatchCount === 1 ? 'match' : 'matches'}
            </Button>
          )}
          
          <Button 
            variant="default" 
            size="sm"
            onClick={() => navigate('/matches')}
            className="flex items-center gap-2"
          >
            <PlayCircle className="h-4 w-4" />
            Browse All Matches
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NoLiveMatchSection;
