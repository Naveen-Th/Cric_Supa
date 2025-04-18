
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Match, Team } from '@/types/cricket';

interface FallOfWicketsProps {
  match: Match;
  teams: Team[];
}

const FallOfWickets = ({ match, teams }: FallOfWicketsProps) => {
  const currentInnings = match.currentInnings === 1 ? match.innings1 : match.innings2;
  
  if (!currentInnings || !currentInnings.wickets) return null;
  
  const battingTeam = teams.find(team => team.id === currentInnings.teamId);
  const fallOfWickets = currentInnings.fallOfWickets || [];
  
  return (
    <Card className="shadow-md border border-cricket-pitch/10">
      <CardHeader>
        <CardTitle className="text-base font-medium">Fall of Wickets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm space-y-2">
          {fallOfWickets.map((wicket, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="font-medium">
                {wicket.runs}/{wicket.wicketNumber}
              </span>
              <span className="text-muted-foreground">
                ({wicket.playerName}, {wicket.overs} ov)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FallOfWickets;
