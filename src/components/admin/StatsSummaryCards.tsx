
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Match, Team } from '@/types/cricket';

interface StatsSummaryCardsProps {
  teams: Team[];
  matches: Match[];
  liveMatch: Match | null;
}

const StatsSummaryCards = ({ teams, matches, liveMatch }: StatsSummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Teams</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{teams.length}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{matches.length}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Active Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {liveMatch ? 'Live Match in Progress' : 'No Live Matches'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsSummaryCards;
