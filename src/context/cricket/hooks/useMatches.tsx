
import { useState, useEffect } from 'react';
import { Match } from '@/types/cricket';
import { fetchMatches, createMatch, updateMatch, deleteMatch } from '../matchUtils';
import { startMatch, endMatch, updateScore, updateOvers, switchInnings } from '../liveMatchUtils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const useMatches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true); // Add loading state
  
  // Derived states
  const liveMatch = matches.find(match => match.status === 'live') || null;
  const completedMatches = matches.filter(match => match.status === 'completed');

  // Load matches from Supabase
  useEffect(() => {
    const loadMatches = async () => {
      try {
        setLoading(true);
        const matchesData = await fetchMatches();
        setMatches(matchesData);
      } catch (error) {
        console.error('Error loading matches:', error);
        toast({
          title: 'Error',
          description: 'Failed to load matches data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadMatches();
    
    // Set up real-time subscription for matches
    const matchesSubscription = supabase
      .channel('matches-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, (payload) => {
        console.log('Matches data changed:', payload);
        loadMatches();
      })
      .subscribe();
    
    // Set up real-time subscription for innings
    const inningsSubscription = supabase
      .channel('innings-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'innings' }, (payload) => {
        console.log('Innings data changed:', payload);
        loadMatches(); // Reload all matches when innings data changes
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(matchesSubscription);
      supabase.removeChannel(inningsSubscription);
    };
  }, []);

  // Match functions with state handling
  const handleCreateMatch = async (matchData: Omit<Match, 'id'>) => {
    try {
      const newMatch = await createMatch(matchData);
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

  const handleUpdateMatch = async (match: Match) => {
    try {
      await updateMatch(match);
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

  const handleDeleteMatch = async (matchId: string) => {
    try {
      await deleteMatch(matchId);
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

  const handleStartMatch = async (matchId: string) => {
    try {
      await startMatch(matchId, matches);
      
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

  const handleEndMatch = async (matchId: string, winnerId: string, mvpId: string) => {
    try {
      await endMatch(matchId, winnerId, mvpId);
      
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

  const handleUpdateScore = async (matchId: string, runs: number, wickets: number = 0) => {
    try {
      await updateScore(matchId, matches, runs, wickets);
      
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

  const handleUpdateOvers = async (matchId: string, overs: number) => {
    try {
      await updateOvers(matchId, matches, overs);
      
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

  const handleSwitchInnings = async (matchId: string) => {
    try {
      await switchInnings(matchId, matches);
      
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
    matches,
    loading, // Export loading state
    liveMatch,
    completedMatches,
    createMatch: handleCreateMatch,
    updateMatch: handleUpdateMatch,
    deleteMatch: handleDeleteMatch,
    startMatch: handleStartMatch,
    endMatch: handleEndMatch,
    updateScore: handleUpdateScore,
    updateOvers: handleUpdateOvers,
    switchInnings: handleSwitchInnings,
  };
};
