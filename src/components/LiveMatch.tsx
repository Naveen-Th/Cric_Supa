
import { useEffect, useState, useCallback } from 'react';
import { Match, Team } from '@/types/cricket';
import { useCricket } from '@/context/CricketContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Trophy } from 'lucide-react';

interface LiveMatchProps {
  match: Match;
  teams: Team[];
  isAdmin?: boolean;
  striker?: string | null;
  nonStriker?: string | null;
}

const LiveMatch = ({ match, teams, isAdmin = false, striker, nonStriker }: LiveMatchProps) => {
  const { updateScore, updateOvers, switchInnings, endMatch } = useCricket();
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  const [previousStriker, setPreviousStriker] = useState<string | null>(null);
  
  const team1 = teams.find(team => team.id === match.team1Id);
  const team2 = teams.find(team => team.id === match.team2Id);
  
  const currentInnings = match.currentInnings === 1 ? match.innings1 : match.innings2;
  const battingTeamId = currentInnings?.teamId || '';
  const battingTeam = teams.find(team => team.id === battingTeamId);
  
  const bowlingTeamId = battingTeamId === match.team1Id ? match.team2Id : match.team1Id;
  const bowlingTeam = teams.find(team => team.id === bowlingTeamId);
  
  const target = match.currentInnings === 2 && match.innings1 
    ? match.innings1.runs + 1 
    : undefined;
  
  const requiredRunRate = (() => {
    if (match.currentInnings !== 2 || !match.innings1 || !match.innings2) return undefined;
    const remainingRuns = match.innings1.runs + 1 - match.innings2.runs;
    const remainingOvers = match.totalOvers - match.innings2.overs;
    if (remainingOvers <= 0 || remainingRuns <= 0) return undefined;
    return (remainingRuns / remainingOvers).toFixed(2);
  })();

  // Track previous striker when the striker changes
  useEffect(() => {
    if (striker === null && previousStriker === null) {
      return;
    }
    
    if (striker !== null && striker !== previousStriker) {
      setPreviousStriker(striker);
    }
  }, [striker, previousStriker]);

  // Reset previous striker on innings change
  useEffect(() => {
    setPreviousStriker(null);
  }, [match.currentInnings]);

  const determineWinner = () => {
    if (!match.innings1) return null;
    
    if (match.currentInnings === 1 && 
        (match.innings1.wickets === 10 || match.innings1.overs >= match.totalOvers)) {
      return null;
    }
    
    if (match.currentInnings === 2 && match.innings2) {
      if (match.innings2.runs > match.innings1.runs) {
        return {
          team: team2,
          margin: `${10 - match.innings2.wickets} wickets`
        };
      }
      
      if (match.innings2.overs >= match.totalOvers || match.innings2.wickets === 10) {
        if (match.innings2.runs < match.innings1.runs) {
          return {
            team: team1,
            margin: `${match.innings1.runs - match.innings2.runs} runs`
          };
        } else if (match.innings2.runs === match.innings1.runs) {
          return { team: null, margin: 'Match Tied' };
        }
      }
    }
    return null;
  };

  const winner = determineWinner();

  const handleAddRuns = (runs: number) => {
    if (!match.id) return;
    updateScore(match.id, runs);
    setLastUpdateTime(Date.now());
  };

  const handleAddWicket = () => {
    if (!match.id) return;
    updateScore(match.id, 0, 1);
    setLastUpdateTime(Date.now());
  };

  const handleUpdateOvers = (overs: number) => {
    if (!match.id) return;
    updateOvers(match.id, overs);
  };

  const handleSwitchInnings = useCallback(() => {
    if (!match.id) return;
    switchInnings(match.id);
  }, [match.id, switchInnings]);

  const handleEndMatch = useCallback((winnerId: string) => {
    if (!match.id) return;
    const mvpId = match.team1Id === winnerId 
      ? match.innings1?.battingOrder[0] || ''
      : match.innings2?.battingOrder[0] || '';
    endMatch(match.id, winnerId, mvpId);
  }, [match, endMatch]);

  useEffect(() => {
    if (
      isAdmin &&
      match.currentInnings === 1 &&
      match.innings1 &&
      (match.innings1.wickets === 10 || match.innings1.overs >= match.totalOvers)
    ) {
      handleSwitchInnings();
    }
    
    if (
      isAdmin &&
      match.currentInnings === 2 &&
      match.innings2 &&
      (match.innings2.wickets === 10 || match.innings2.overs >= match.totalOvers)
    ) {
      if (match.innings1 && match.innings2) {
        const winnerId = match.innings2.runs > match.innings1.runs 
          ? match.team2Id 
          : match.team1Id;
        handleEndMatch(winnerId);
      }
    }
    
    if (
      isAdmin &&
      match.currentInnings === 2 &&
      match.innings1 &&
      match.innings2 &&
      match.innings2.runs > match.innings1.runs
    ) {
      handleEndMatch(match.team2Id);
    }
  }, [handleEndMatch, handleSwitchInnings, isAdmin, match]);

  if (!team1 || !team2 || !battingTeam || !bowlingTeam || !currentInnings) {
    return (
      <Card className="animate-in fade-in-50">
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-cricket-accent" />
            <span className="text-sm text-muted-foreground">Loading match data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get player stats and details
  const strikerPlayer = striker ? battingTeam.players.find(p => p.id === striker) : null;
  const nonStrikerPlayer = nonStriker ? battingTeam.players.find(p => p.id === nonStriker) : null;
  const previousStrikerPlayer = previousStriker && !striker ? 
    battingTeam.players.find(p => p.id === previousStriker) : null;

  return (
    <Card className="overflow-hidden shadow-lg border-2 border-cricket-pitch/20 bg-gradient-to-br from-background to-muted/20">
      <CardHeader className="relative p-6 cricket-field-bg before:absolute before:inset-0 before:bg-black/20 before:z-0">
        <div className="relative z-10 flex justify-between items-center gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn(
                "bg-white/10 text-white border-white/20",
                match.status === 'completed' && "bg-green-500/20 border-green-500/30"
              )}>
                {match.status === 'live' ? 'LIVE' : match.status.toUpperCase()}
              </Badge>
              {match.venue && (
                <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                  {match.venue}
                </Badge>
              )}
            </div>
            <CardTitle className="text-2xl text-white font-bold">
              {team1.name} vs {team2.name}
            </CardTitle>
          </div>
          {match.status === 'completed' && match.winnerId && match.innings1 && match.innings2 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
                <div className="text-white">
                  <div className="font-bold">
                    {match.winnerId === team1.id ? team1.name : team2.name}
                  </div>
                  <div className="text-sm opacity-90">
                    Won by {match.winnerId === team2.id
                      ? `${10 - match.innings2.wickets} wickets`
                      : `${match.innings1.runs - match.innings2.runs} runs`
                    }
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        <div className="bg-gradient-to-br from-card to-muted/50 rounded-xl p-6 shadow-inner">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">{battingTeam.name}</span>
                  <Badge variant="secondary" className="animate-in slide-in-from-right">Batting</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {bowlingTeam.name} bowling
                </p>
              </div>
              <div className="text-4xl font-bold tabular-nums tracking-tight">
                <span className={cn(
                  "transition-all duration-300",
                  lastUpdateTime && Date.now() - lastUpdateTime < 1000 && "animate-score-update text-cricket-accent"
                )}>
                  {currentInnings.runs}/{currentInnings.wickets}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Overs: {currentInnings.overs.toFixed(1)}/{match.totalOvers}</span>
                <span>RR: {currentInnings.overs > 0 
                  ? (currentInnings.runs / currentInnings.overs).toFixed(2) 
                  : '0.00'}</span>
              </div>
              
              <Progress 
                value={(currentInnings.overs / match.totalOvers) * 100} 
                className="h-2 bg-muted"
              />

              <div className="mt-4">
                <div className="flex flex-col space-y-3">
                  {striker && strikerPlayer && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">
                          *
                        </Badge>
                        <span className="font-semibold">
                          {strikerPlayer.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="tabular-nums font-bold">
                          {strikerPlayer.battingStats?.runs || 0}
                        </span>
                        <span className="text-sm text-muted-foreground tabular-nums">
                          ({strikerPlayer.battingStats?.ballsFaced || 0} balls)
                        </span>
                        {strikerPlayer.battingStats?.fours || strikerPlayer.battingStats?.sixes ? (
                          <span className="text-xs text-muted-foreground">
                            {strikerPlayer.battingStats?.fours || 0}×4, {strikerPlayer.battingStats?.sixes || 0}×6
                          </span>
                        ) : null}
                      </div>
                    </div>
                  )}
                  
                  {nonStriker && nonStrikerPlayer && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="opacity-50">
                          •
                        </Badge>
                        <span className="text-muted-foreground">
                          {nonStrikerPlayer.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="tabular-nums">
                          {nonStrikerPlayer.battingStats?.runs || 0}
                        </span>
                        <span className="text-sm text-muted-foreground tabular-nums">
                          ({nonStrikerPlayer.battingStats?.ballsFaced || 0} balls)
                        </span>
                        {nonStrikerPlayer.battingStats?.fours || nonStrikerPlayer.battingStats?.sixes ? (
                          <span className="text-xs text-muted-foreground">
                            {nonStrikerPlayer.battingStats?.fours || 0}×4, {nonStrikerPlayer.battingStats?.sixes || 0}×6
                          </span>
                        ) : null}
                      </div>
                    </div>
                  )}

                  {!striker && previousStrikerPlayer && (
                    <div className="flex items-center justify-between bg-red-50 p-2 rounded-md">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="opacity-80">
                          OUT
                        </Badge>
                        <span className="font-medium text-red-700">
                          {previousStrikerPlayer.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="tabular-nums">
                          {previousStrikerPlayer.battingStats?.runs || 0}
                        </span>
                        <span className="text-sm text-muted-foreground tabular-nums">
                          ({previousStrikerPlayer.battingStats?.ballsFaced || 0} balls)
                        </span>
                      </div>
                    </div>
                  )}

                  {!striker && !nonStriker && !previousStrikerPlayer && (
                    <div className="text-sm text-muted-foreground italic">
                      Waiting for batsmen...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {match.currentInnings === 2 && target && (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-cricket-secondary/10 to-cricket-secondary/5 p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-cricket-secondary">Target: {target}</h3>
                  <p className="text-sm text-muted-foreground">
                    Needs {target - (currentInnings.runs || 0)} runs from {((match.totalOvers - currentInnings.overs) * 6).toFixed(0)} balls
                  </p>
                </div>
                {requiredRunRate && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-cricket-secondary">{requiredRunRate}</div>
                    <div className="text-xs text-muted-foreground">Required Rate</div>
                  </div>
                )}
              </div>
              
              <Progress 
                value={((currentInnings.runs || 0) / target) * 100} 
                className="h-2 bg-muted [&>div]:bg-cricket-secondary"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveMatch;
