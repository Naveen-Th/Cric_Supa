
import { useEffect, useState } from 'react';
import { Match, Team } from '@/types/cricket';
import { useCricket } from '@/context/CricketContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface LiveMatchProps {
  match: Match;
  teams: Team[];
  isAdmin?: boolean;
}

const LiveMatch = ({ match, teams, isAdmin = false }: LiveMatchProps) => {
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

  const handleSwitchInnings = () => {
    if (!match.id) return;
    switchInnings(match.id);
  };

  const handleEndMatch = (winnerId: string) => {
    if (!match.id) return;
    // For now, we'll just use a placeholder MVP
    const mvpId = match.team1Id === winnerId 
      ? match.innings1?.battingOrder[0] || ''
      : match.innings2?.battingOrder[0] || '';
    endMatch(match.id, winnerId, mvpId);
  };

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
  }, [match]);

  if (!team1 || !team2 || !battingTeam || !bowlingTeam || !currentInnings) {
    return <div>Loading match data...</div>;
  }

  return (
    <Card className="overflow-hidden shadow-lg border-2 border-cricket-pitch">
      <CardHeader className="cricket-field-bg text-white p-4">
        <div className="flex justify-between items-center">
          <div>
            <Badge variant="outline" className="bg-white/20 text-white">
              {match.status.toUpperCase()}
            </Badge>
            <CardTitle className="mt-2 text-lg">{team1.name} vs {team2.name}</CardTitle>
          </div>
          <Badge variant="outline" className="bg-white/20 text-white">
            {match.venue}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="bg-gray-100 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="font-semibold">{battingTeam.name}</div>
            <div className="text-lg font-bold">
              <span className={`${lastUpdateTime && Date.now() - lastUpdateTime < 1000 ? 'animate-score-update' : ''}`}>
                {currentInnings.runs}/{currentInnings.wickets}
              </span>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 flex justify-between">
            <div>Overs: {currentInnings.overs.toFixed(1)}/{match.totalOvers}</div>
            <div>Run Rate: {currentInnings.overs > 0 
              ? (currentInnings.runs / Math.floor(currentInnings.overs)).toFixed(2) 
              : '0.00'}</div>
          </div>
          
          <Progress 
            value={(currentInnings.overs / match.totalOvers) * 100} 
            className="mt-2 h-2" 
          />
        </div>
        
        {match.currentInnings === 2 && target && (
          <div className="mb-4 p-3 bg-cricket-accent/10 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="font-medium text-cricket-accent">Target: {target}</div>
              {requiredRunRate && (
                <div className="text-sm">Required RR: {requiredRunRate}</div>
              )}
            </div>
            <div className="mt-2 text-sm">
              Need {target - (currentInnings.runs || 0)} runs from {((match.totalOvers - currentInnings.overs) * 6).toFixed(0)} balls
            </div>
          </div>
        )}
        
        {isAdmin && (
          <div className="mt-4 border-t pt-4">
            <h3 className="font-semibold mb-2">Match Controls</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              <Button size="sm" variant="outline" onClick={() => handleAddRuns(0)}>Dot</Button>
              <Button size="sm" variant="outline" onClick={() => handleAddRuns(1)}>1 Run</Button>
              <Button size="sm" variant="outline" onClick={() => handleAddRuns(2)}>2 Runs</Button>
              <Button size="sm" variant="outline" onClick={() => handleAddRuns(3)}>3 Runs</Button>
              <Button size="sm" variant="outline" onClick={() => handleAddRuns(4)}>4 Runs</Button>
              <Button size="sm" variant="outline" onClick={() => handleAddRuns(6)}>6 Runs</Button>
              <Button size="sm" variant="destructive" onClick={handleAddWicket}>Wicket</Button>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => handleUpdateOvers(parseFloat((currentInnings.overs + 0.1).toFixed(1)))}
              >
                +0.1 Over
              </Button>
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => handleUpdateOvers(parseFloat((currentInnings.overs + 1).toFixed(1)))}
              >
                +1 Over
              </Button>
            </div>
            
            {match.currentInnings === 1 && (
              <Button 
                className="w-full"
                onClick={handleSwitchInnings}
              >
                End Innings 1
              </Button>
            )}
            
            {match.currentInnings === 2 && (
              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={() => handleEndMatch(match.team1Id)}
                >
                  {team1.name} Wins
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => handleEndMatch(match.team2Id)}
                >
                  {team2.name} Wins
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveMatch;
