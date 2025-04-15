import { Player } from '@/types/cricket';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Bath, CircleDot, Shield, UserCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface PlayersTableProps {
  players: Player[];
  teams: { id: string; name: string }[];
  onEditPlayer: (player: Player) => void;
  sortField?: 'name' | 'teamName';
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: 'name' | 'teamName') => void;
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'Batsman':
      return <Bath className="h-4 w-4" />;
    case 'Bowler':
      return <CircleDot className="h-4 w-4" />;
    case 'All-Rounder':
      return <Shield className="h-4 w-4" />;
    case 'Wicket Keeper':
      return <UserCircle2 className="h-4 w-4" />;
    default:
      return null;
  }
};

const PlayersTable = ({ 
  players, 
  teams, 
  onEditPlayer, 
  sortField = 'name',
  sortOrder = 'asc',
  onSort 
}: PlayersTableProps) => {
  const getSortIcon = (field: 'name' | 'teamName') => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Player List</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => onSort?.('name')}
              >
                Name{getSortIcon('name')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => onSort?.('teamName')}
              >
                Team{getSortIcon('teamName')}
              </TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Batting Stats</TableHead>
              <TableHead>Bowling Stats</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.length > 0 ? (
              players.map(player => (
                <TableRow key={player.id}>
                  <TableCell className="font-medium">{player.name}</TableCell>
                  <TableCell>
                    {teams.find(t => t.id === player.teamId)?.name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "flex items-center gap-1.5",
                        player.role === 'Batsman' 
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : player.role === 'Bowler'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : player.role === 'Wicket Keeper'
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      )}
                    >
                      {getRoleIcon(player.role)}
                      {player.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {player.battingStats?.runs || 0} runs ({player.battingStats?.ballsFaced || 0} balls)
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {player.bowlingStats?.wickets || 0} wickets ({player.bowlingStats?.overs || 0} overs)
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditPlayer(player)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No players found matching the search criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PlayersTable;
