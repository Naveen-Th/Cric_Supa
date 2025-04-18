
import { Player } from '@/types/cricket';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Trophy, BarChart2, ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
      <Card className="shadow-md overflow-hidden border border-gray-100">
        <CardHeader className="bg-gray-50 border-b border-gray-100 px-5 py-4">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-1 p-5">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Display empty state if no players with stats
  if (players.length === 0) {
    return (
      <Card className="shadow-md overflow-hidden">
        <CardHeader className="bg-gray-50 border-b border-gray-100 px-5 py-4">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col items-center justify-center py-10">
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
    <Card className="shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="bg-gray-50 border-b border-gray-100 px-5 py-4">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-medium">Player</TableHead>
              {type === 'batting' ? (
                <>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="font-medium" onClick={() => sortPlayers('runs')}>
                      Runs
                      {getSortIcon('runs')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="font-medium" onClick={() => sortPlayers('ballsFaced')}>
                      Balls
                      {getSortIcon('ballsFaced')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="font-medium" onClick={() => sortPlayers('strikerate')}>
                      SR
                      {getSortIcon('strikerate')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="font-medium" onClick={() => sortPlayers('fours')}>
                      4s
                      {getSortIcon('fours')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="font-medium" onClick={() => sortPlayers('sixes')}>
                      6s
                      {getSortIcon('sixes')}
                    </Button>
                  </TableHead>
                </>
              ) : (
                <>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="font-medium" onClick={() => sortPlayers('wickets')}>
                      Wickets
                      {getSortIcon('wickets')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="font-medium" onClick={() => sortPlayers('overs')}>
                      Overs
                      {getSortIcon('overs')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="font-medium" onClick={() => sortPlayers('runs')}>
                      Runs
                      {getSortIcon('runs')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="font-medium" onClick={() => sortPlayers('economy')}>
                      Econ
                      {getSortIcon('economy')}
                    </Button>
                  </TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPlayers.map((player, index) => (
              <TableRow 
                key={player.id}
                className={cn(
                  index < 3 && "bg-gray-50/50",
                  index === 0 && "bg-amber-50/30"
                )}
              >
                <TableCell className="font-medium flex items-center gap-2">
                  {index < 3 && (
                    <Badge className={cn(
                      "w-5 h-5 flex items-center justify-center p-0 rounded-full",
                      index === 0 && "bg-amber-500",
                      index === 1 && "bg-slate-400",
                      index === 2 && "bg-amber-700"
                    )}>
                      {index + 1}
                    </Badge>
                  )}
                  {player.name}
                </TableCell>
                {type === 'batting' ? (
                  <>
                    <TableCell className="font-semibold">{player.battingStats?.runs || 0}</TableCell>
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
                    <TableCell className="font-semibold">{player.bowlingStats?.wickets || 0}</TableCell>
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
