
import { Team } from '@/types/cricket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface TeamCardProps {
  team: Team;
}

const TeamCard = ({ team }: TeamCardProps) => {
  const navigate = useNavigate();
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="bg-gradient-to-r from-cricket-pitch to-cricket-pitch-dark text-white p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{team.name}</CardTitle>
          <Badge variant="outline" className="bg-white/20 text-white">
            {team.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-500">Players: {team.players.length}</div>
          <div className="flex gap-2">
            <Badge variant="secondary">
              {team.players.filter(p => p.role === 'Batsman').length} Batsmen
            </Badge>
            <Badge variant="secondary">
              {team.players.filter(p => p.role === 'Bowler').length} Bowlers
            </Badge>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => navigate(`/teams/${team.id}`)}
        >
          View Team
        </Button>
      </CardContent>
    </Card>
  );
};

export default TeamCard;
