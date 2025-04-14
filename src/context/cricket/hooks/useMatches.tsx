
import { useState, useEffect } from 'react';
import { Match } from '@/types/cricket';
import { fetchMatches, createMatch, updateMatch, deleteMatch } from '../matchUtils';
import { startMatch, endMatch, updateScore, updateOvers, switchInnings } from '../liveMatchUtils';
import { supabase } from '@/integrations/supabase/client';

export const useMatches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  
  // Derived states
  const liveMatch = matches.find(match => match.status === 'live') || null;
  const completedMatches = matches.filter(match => match.status === 'completed');

  // Load matches from Supabase
  useEffect(() => {
    const loadMatches = async () => {
      const matchesData = await fetchMatches();
      setMatches(matchesData);
    };
    
    loadMatches();
    
    // Set up real-time subscription
    const matchesSubscription = supabase
      .channel('matches-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => fetchMatches().then(setMatches))
      .subscribe();
      
    return () => {
      supabase.removeChannel(matchesSubscription);
    };
  }, []);

  // Match functions with state handling
  const handleCreateMatch = async (matchData: Omit<Match, 'id'>) => {
    const newMatch = await createMatch(matchData);
    setMatches(prev => [...prev, newMatch]);
    return newMatch;
  };

  const handleUpdateMatch = async (match: Match) => {
    await updateMatch(match);
    setMatches(prev => prev.map(m => (m.id === match.id ? match : m)));
  };

  const handleDeleteMatch = async (matchId: string) => {
    await deleteMatch(matchId);
    setMatches(prev => prev.filter(m => m.id !== matchId));
  };

  const handleStartMatch = async (matchId: string) => {
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
  };

  const handleEndMatch = async (matchId: string, winnerId: string, mvpId: string) => {
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
  };

  const handleUpdateScore = async (matchId: string, runs: number, wickets: number = 0) => {
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
  };

  const handleUpdateOvers = async (matchId: string, overs: number) => {
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
  };

  const handleSwitchInnings = async (matchId: string) => {
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
  };

  return {
    matches,
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
