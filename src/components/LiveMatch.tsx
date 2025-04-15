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
  
  // Get team objects
  const team1 = teams.find(team => team.id === match.team1Id);
  const team2 = teams.find(team => team.id === match.team2Id);
  
  // Current batting team
  const currentInnings = match.currentInnings === 1 ? match.innings1 : match.innings2;
  const battingTeamId = currentInnings?.teamId || '';
  const battingTeam = teams.find(team => team.id === battingTeamId);
  
  // Current bowling team
  const bowlingTeamId = battingTeamId === match.team1Id ? match.team2Id : match.team1Id;
  const bowlingTeam = teams.find(team => team.id === bowlingTeamId);
  
  // Calculate target for second innings
  const target = match.currentInnings === 2 && match.innings1 
    ? match.innings1.runs + 1 
    : undefined;
  
  // Calculate required run rate for second innings
  const requiredRunRate = (() => {
    if (match.currentInnings !== 2 || !match.innings1 || !match.innings2) return undefined;
    const remainingRuns = match.innings1.runs + 1 - match.innings2.runs;
    const remainingOvers = match.totalOvers - match.innings2.overs;
    if (remainingOvers <= 0 || remainingRuns <= 0) return undefined;
    return (remainingRuns / remainingOvers).toFixed(2);
  })();

  // Add winner determination logic
  const determineWinner = () => {
    if (!match.innings1) return null;
    
    // First innings complete and second innings hasn't started
    if (match.currentInnings === 1 && 
        (match.innings1.wickets === 10 || match.innings1.overs >= match.totalOvers)) {
      return null; // No winner yet, innings break
    }
    
    // Second innings scenarios
    if (match.currentInnings === 2 && match.innings2) {
      // Team 2 surpassed target
      if (match.innings2.runs > match.innings1.runs) {
        return {
          team: team2,
          margin: `${10 - match.innings2.wickets} wickets`
        };
      }
      
      // All overs complete or all wickets fallen
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

  // Admin controls for updating the match
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

  // Check if innings should switch automatically
  useEffect(() => {
    if (
      isAdmin &&
      match.currentInnings === 1 &&
      match.innings1 &&
      (match.innings1.wickets === 10 || match.innings1.overs >= match.totalOvers)
    ) {
      // Auto switch innings
      handleSwitchInnings();
    }
    
    // Check if match should end (team 2 all out or overs complete)
    if (
      isAdmin &&
      match.currentInnings === 2 &&
      match.innings2 &&
      (match.innings2.wickets === 10 || match.innings2.overs >= match.totalOvers)
    ) {
      // Determine winner
      if (match.innings1 && match.innings2) {
        const winnerId = match.innings2.runs > match.innings1.runs 
          ? match.team2Id 
          : match.team1Id;
        handleEndMatch(winnerId);
      }
    }
    
    // Check if team 2 has chased the target
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
        {/* Current Innings Score Section */}
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

              {/* Batting Partnership Section */}
              <div className="mt-4">
                <div className="flex flex-col space-y-3">
                  {striker && battingTeam?.players && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">
                          *
                        </Badge>
                        <span className="font-semibold">
                          {battingTeam.players.find(p => p.id === striker)?.name || 'Striker'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="tabular-nums">
                          {battingTeam.players.find(p => p.id === striker)?.battingStats?.runs || 0}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({battingTeam.players.find(p => p.id === striker)?.battingStats?.ballsFaced || 0})
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {nonStriker && battingTeam?.players && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="opacity-50">
                          •
                        </Badge>
                        <span className="text-muted-foreground">
                          {battingTeam.players.find(p => p.id === nonStriker)?.name || 'Non-striker'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="tabular-nums">
                          {battingTeam.players.find(p => p.id === nonStriker)?.battingStats?.runs || 0}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({battingTeam.players.find(p => p.id === nonStriker)?.battingStats?.ballsFaced || 0})
                        </span>
                      </div>
                    </div>
                  )}

                  {!striker && !nonStriker && (
                    <div className="text-sm text-muted-foreground italic">
                      Waiting for batsmen...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Target and Required Rate Section */}
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
