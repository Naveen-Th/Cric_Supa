
import React, { createContext, useContext, ReactNode } from 'react';
import { CricketContextType } from './cricketTypes';
import { useTeams } from './hooks/useTeams';
import { usePlayers } from './hooks/usePlayers';
import { useMatches } from './hooks/useMatches';
import { useAuth } from '../AuthContext';

const CricketContext = createContext<CricketContextType | undefined>(undefined);

export const CricketProvider = ({ children }: { children: ReactNode }) => {
  const { isAdmin } = useAuth();
  
  // Use the separate hooks for teams, players, and matches
  const { teams, activeTeams, createTeam, updateTeam, deleteTeam, setTeams } = useTeams();
  const { players, addPlayer, updatePlayer, deletePlayer } = usePlayers(setTeams);
  const { 
    matches, 
    liveMatch, 
    completedMatches,
    createMatch, 
    updateMatch, 
    deleteMatch,
    startMatch,
    endMatch,
    updateScore,
    updateOvers,
    switchInnings
  } = useMatches();

  // Context value
  const contextValue: CricketContextType = {
    teams,
    players,
    matches,
    liveMatch,
    activeTeams,
    completedMatches,
    createTeam,
    updateTeam,
    deleteTeam,
    addPlayer,
    updatePlayer,
    deletePlayer,
    createMatch,
    updateMatch,
    deleteMatch,
    startMatch,
    endMatch,
    updateScore,
    updateOvers,
    switchInnings,
  };

  return (
    <CricketContext.Provider value={contextValue}>
      {children}
    </CricketContext.Provider>
  );
};

export const useCricket = () => {
  const context = useContext(CricketContext);
  if (context === undefined) {
    throw new Error('useCricket must be used within a CricketProvider');
  }
  return context;
};
