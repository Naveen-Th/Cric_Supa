import { Player } from '@/types/cricket';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Trophy, BarChart2, ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface StatisticsTableProps {
  title: string;
  players: Player[];
  type: 'batting' | 'bowling';
  loading?: boolean;
}

const StatisticsTable = ({ title, players, type, loading = false }: StatisticsTableProps) => {
  const [sortField, setSortField] = useState<string>(type === 'batting' ? 'runs' : 'wickets');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Helper function to sort players
  const sortPlayers = (fieldName: string) => {
    if (sortField === fieldName) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(fieldName);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (fieldName: string) => {
    if (sortField !== fieldName) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    return sortOrder === 'asc' 
      ? <ArrowUpIcon className="ml-2 h-4 w-4" />
      : <ArrowDownIcon className="ml-2 h-4 w-4" />;
  };
  
  // Sort players based on the selected field and order
  const sortedPlayers = [...players].sort((a, b) => {
    let fieldA, fieldB;
    
    if (type === 'batting') {
      const statsA = a.battingStats || { runs: 0, ballsFaced: 0, fours: 0, sixes: 0 };
      const statsB = b.battingStats || { runs: 0, ballsFaced: 0, fours: 0, sixes: 0 };
      
      switch (sortField) {
        case 'runs':
          fieldA = statsA.runs || 0;
          fieldB = statsB.runs || 0;
          break;
        case 'ballsFaced':
          fieldA = statsA.ballsFaced || 0;
          fieldB = statsB.ballsFaced || 0;
          break;
        case 'fours':
          fieldA = statsA.fours || 0;
          fieldB = statsB.fours || 0;
          break;
        case 'sixes':
          fieldA = statsA.sixes || 0;
          fieldB = statsB.sixes || 0;
          break;
        case 'strikerate': {
          const srA = statsA.ballsFaced ? ((statsA.runs / statsA.ballsFaced) * 100) : 0;
          const srB = statsB.ballsFaced ? ((statsB.runs / statsB.ballsFaced) * 100) : 0;
          fieldA = srA;
          fieldB = srB;
          break;
        }
        default:
          fieldA = a.name;
          fieldB = b.name;
      }
    } else {
      const statsA = a.bowlingStats || { wickets: 0, overs: 0, runs: 0, maidens: 0 };
      const statsB = b.bowlingStats || { wickets: 0, overs: 0, runs: 0, maidens: 0 };
      
      switch (sortField) {
        case 'wickets':
          fieldA = statsA.wickets || 0;
          fieldB = statsB.wickets || 0;
          break;
        case 'overs':
          fieldA = statsA.overs || 0;
          fieldB = statsB.overs || 0;
          break;
        case 'runs':
          fieldA = statsA.runs || 0;
          fieldB = statsB.runs || 0;
          break;
        case 'economy': {
          const econA = statsA.overs ? (statsA.runs / statsA.overs) : 999;
          const econB = statsB.overs ? (statsB.runs / statsB.overs) : 999;
          fieldA = econA;
          fieldB = econB;
          // For economy, lower is better
          return sortOrder === 'asc' ? fieldA - fieldB : fieldB - fieldA;
        }
        default:
          fieldA = a.name;
          fieldB = b.name;
      }
    }
    
    return sortOrder === 'asc' ? fieldA - fieldB : fieldB - fieldA;
  });
  
  // Display loading skeleton
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Display empty state if no players with stats
  if (players.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            {type === 'batting' ? (
              <Trophy className="h-12 w-12 text-gray-200 mb-4" />
            ) : (
              <BarChart2 className="h-12 w-12 text-gray-200 mb-4" />
            )}
            <p className="text-gray-500">No statistics available</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              {type === 'batting' ? (
                <>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => sortPlayers('runs')}>
                      Runs
                      {getSortIcon('runs')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => sortPlayers('ballsFaced')}>
                      Balls
                      {getSortIcon('ballsFaced')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => sortPlayers('strikerate')}>
                      SR
                      {getSortIcon('strikerate')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => sortPlayers('fours')}>
                      4s
                      {getSortIcon('fours')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => sortPlayers('sixes')}>
                      6s
                      {getSortIcon('sixes')}
                    </Button>
                  </TableHead>
                </>
              ) : (
                <>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => sortPlayers('wickets')}>
                      Wickets
                      {getSortIcon('wickets')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => sortPlayers('overs')}>
                      Overs
                      {getSortIcon('overs')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => sortPlayers('runs')}>
                      Runs
                      {getSortIcon('runs')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => sortPlayers('economy')}>
                      Econ
                      {getSortIcon('economy')}
                    </Button>
                  </TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPlayers.map(player => (
              <TableRow key={player.id}>
                <TableCell className="font-medium">{player.name}</TableCell>
                {type === 'batting' ? (
                  <>
                    <TableCell>{player.battingStats?.runs || 0}</TableCell>
                    <TableCell>{player.battingStats?.ballsFaced || 0}</TableCell>
                    <TableCell>
                      {player.battingStats?.ballsFaced 
                        ? ((player.battingStats.runs / player.battingStats.ballsFaced) * 100).toFixed(2)
                        : '0.00'
                      }
                    </TableCell>
                    <TableCell>{player.battingStats?.fours || 0}</TableCell>
                    <TableCell>{player.battingStats?.sixes || 0}</TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>{player.bowlingStats?.wickets || 0}</TableCell>
                    <TableCell>{player.bowlingStats?.overs || 0}</TableCell>
                    <TableCell>{player.bowlingStats?.runs || 0}</TableCell>
                    <TableCell>
                      {player.bowlingStats?.overs 
                        ? (player.bowlingStats.runs / player.bowlingStats.overs).toFixed(2)
                        : '0.00'
                      }
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default StatisticsTable;
