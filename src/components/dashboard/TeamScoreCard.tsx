
import { Match, Team, Player } from '@/types/cricket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface TeamScoreCardProps {
  match: Match;
  team: Team;
  innings: 1 | 2;
  battingPlayers: Player[];
}

const TeamScoreCard = ({ match, team, innings, battingPlayers }: TeamScoreCardProps) => {
  const currentInnings = innings === 1 ? match.innings1 : match.innings2;
  
  if (!currentInnings) return null;

  const playersWithStats = battingPlayers.filter(player => 
    player.battingStats && player.battingStats.runs > 0
  );

  const yetToBat = battingPlayers.filter(player => 
    !player.battingStats || player.battingStats.runs === 0
  );

  return (
    <Card className="shadow-lg border-2 border-cricket-pitch/10">
      <CardHeader className="bg-gradient-to-br from-cricket-primary/5 to-cricket-secondary/5">
        <CardTitle className="text-xl font-semibold flex items-center justify-between">
          {team.name}
          <span className="text-base">
            {currentInnings.runs}/{currentInnings.wickets} ({currentInnings.overs} ov)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[300px]">Batter</TableHead>
              <TableHead className="text-right">R</TableHead>
              <TableHead className="text-right">B</TableHead>
              <TableHead className="text-right">4s</TableHead>
              <TableHead className="text-right">6s</TableHead>
              <TableHead className="text-right">SR</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {playersWithStats.map((player) => {
              const strikeRate = player.battingStats?.ballsFaced 
                ? ((player.battingStats.runs / player.battingStats.ballsFaced) * 100).toFixed(2)
                : "0.00";
                
              return (
                <TableRow key={player.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {player.name}
                      {!player.battingStats?.ballsFaced && (
                        <Badge variant="outline" className="text-xs">
                          Not Out
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {player.battingStats?.runs || 0}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {player.battingStats?.ballsFaced || 0}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {player.battingStats?.fours || 0}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {player.battingStats?.sixes || 0}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {strikeRate}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {yetToBat.length > 0 && (
          <div className="p-4 border-t">
            <p className="text-sm font-medium mb-2">Yet to Bat</p>
            <p className="text-sm text-muted-foreground">
              {yetToBat.map(player => player.name).join(' • ')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamScoreCard;
