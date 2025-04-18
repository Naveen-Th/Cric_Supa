
import { Match } from '@/types/cricket';
import { 
  createMatch as createMatchUtil, 
  updateMatch as updateMatchUtil, 
  deleteMatch as deleteMatchUtil 
} from '../matchUtils';
import { 
  startMatch as startMatchUtil, 
  endMatch as endMatchUtil, 
  updateScore as updateScoreUtil, 
  updateOvers as updateOversUtil, 
  switchInnings as switchInningsUtil 
} from '../liveMatchUtils';
import { toast } from '@/components/ui/use-toast';

export const useMatchHandlers = (
  matches: Match[], 
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>
) => {
  // Match creation
  const createMatch = async (matchData: Omit<Match, 'id'>) => {
    try {
      const newMatch = await createMatchUtil(matchData);
      setMatches(prev => [...prev, newMatch]);
      return newMatch;
    } catch (error) {
      console.error('Error creating match:', error);
      toast({
        title: 'Error',
        description: 'Failed to create match',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Match update
  const updateMatch = async (match: Match) => {
    try {
      await updateMatchUtil(match);
      setMatches(prev => prev.map(m => (m.id === match.id ? match : m)));
    } catch (error) {
      console.error('Error updating match:', error);
      toast({
        title: 'Error',
        description: 'Failed to update match',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Match deletion
  const deleteMatch = async (matchId: string) => {
    try {
      await deleteMatchUtil(matchId);
      setMatches(prev => prev.filter(m => m.id !== matchId));
    } catch (error) {
      console.error('Error deleting match:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete match',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Match start
  const startMatch = async (matchId: string) => {
    try {
      await startMatchUtil(matchId, matches);
      
      const match = matches.find(m => m.id === matchId);
      if (!match) return;
      
      const firstInningsTeamId = match.tossWinnerId === match.team1Id && match.tossChoice === 'bat' 
                                ? match.team1Id 
                                : match.team2Id;
      
      setMatches(prev =>
        prev.map(m =>
          m.id === matchId
            ? {
                ...m,
                status: 'live',
                currentInnings: 1,
                innings1: {
                  teamId: firstInningsTeamId,
                  runs: 0,
                  wickets: 0,
                  overs: 0,
                  battingOrder: [],
                  extras: 0,
                },
              }
            : m
        )
      );
    } catch (error) {
      console.error('Error starting match:', error);
      toast({
        title: 'Error',
        description: 'Failed to start match',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Match end
  const endMatch = async (matchId: string, winnerId: string, mvpId: string) => {
    try {
      await endMatchUtil(matchId, winnerId, mvpId);
      
      setMatches(prev =>
        prev.map(m =>
          m.id === matchId
            ? {
                ...m,
                status: 'completed',
                winnerId,
                mvpId,
              }
            : m
        )
      );
    } catch (error) {
      console.error('Error ending match:', error);
      toast({
        title: 'Error',
        description: 'Failed to end match',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Update score
  const updateScore = async (matchId: string, runs: number, wickets: number = 0) => {
    try {
      await updateScoreUtil(matchId, matches, runs, wickets);
      
      const match = matches.find(m => m.id === matchId);
      if (!match) return;
      
      const currentInningsNumber = match.currentInnings;
      const currentInnings = currentInningsNumber === 1 ? match.innings1 : match.innings2;
      
      if (!currentInnings) return;
      
      setMatches(prev =>
        prev.map(m => {
          if (m.id !== matchId) return m;
          
          const updatedInnings = {
            ...currentInnings,
            runs: (currentInnings.runs || 0) + runs,
            wickets: (currentInnings.wickets || 0) + wickets,
          };
          
          return {
            ...m,
            innings1: currentInningsNumber === 1 ? updatedInnings : m.innings1,
            innings2: currentInningsNumber === 2 ? updatedInnings : m.innings2,
          };
        })
      );
    } catch (error) {
      console.error('Error updating score:', error);
      toast({
        title: 'Error',
        description: 'Failed to update score',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Update overs
  const updateOvers = async (matchId: string, overs: number) => {
    try {
      await updateOversUtil(matchId, matches, overs);
      
      setMatches(prev =>
        prev.map(m => {
          if (m.id !== matchId) return m;
          
          const currentInningsNumber = m.currentInnings;
          
          if (currentInningsNumber === 1 && m.innings1) {
            return {
              ...m,
              innings1: {
                ...m.innings1,
                overs,
              },
            };
          } else if (currentInningsNumber === 2 && m.innings2) {
            return {
              ...m,
              innings2: {
                ...m.innings2,
                overs,
              },
            };
          }
          
          return m;
        })
      );
    } catch (error) {
      console.error('Error updating overs:', error);
      toast({
        title: 'Error',
        description: 'Failed to update overs',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Switch innings
  const switchInnings = async (matchId: string) => {
    try {
      await switchInningsUtil(matchId, matches);
      
      const match = matches.find(m => m.id === matchId);
      if (!match || match.currentInnings !== 1) return;
      
      const secondInningsTeamId = match.innings1?.teamId === match.team1Id ? match.team2Id : match.team1Id;
      
      setMatches(prev =>
        prev.map(m => {
          if (m.id !== matchId) return m;
          
          return {
            ...m,
            currentInnings: 2,
            innings2: {
              teamId: secondInningsTeamId,
              runs: 0,
              wickets: 0,
              overs: 0,
              battingOrder: [],
              extras: 0,
            },
          };
        })
      );
    } catch (error) {
      console.error('Error switching innings:', error);
      toast({
        title: 'Error',
        description: 'Failed to switch innings',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    createMatch,
    updateMatch,
    deleteMatch,
    startMatch,
    endMatch,
    updateScore,
    updateOvers,
    switchInnings,
  };
};
