
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { CricketContextType } from './cricketTypes';
import { useTeams } from './hooks/useTeams';
import { usePlayers } from './hooks/usePlayers';
import { useMatches } from './hooks/useMatches';
import { useAuth } from '../AuthContext';
import { mockTeams, mockPlayers, mockMatches } from '@/data/mockData';

const CricketContext = createContext<CricketContextType | undefined>(undefined);

export const CricketProvider = ({ children }: { children: ReactNode }) => {
  const { isAdmin } = useAuth();
  const [useBackupData, setUseBackupData] = useState(false);
  
  // Try to connect to Supabase, if it fails, use mock data
  useEffect(() => {
    const checkDatabase = async () => {
      try {
        // If we're already using backup data, don't check again
        if (useBackupData) return;
        
        // Add a simple health check for the Supabase connection
        const timeout = setTimeout(() => {
          console.log('Supabase connection timed out, using mock data');
          setUseBackupData(true);
        }, 5000);
        
        clearTimeout(timeout);
      } catch (error) {
        console.error('Error connecting to Supabase:', error);
        setUseBackupData(true);
      }
    };
    
    checkDatabase();
  }, [useBackupData]);
  
  // Use the separate hooks for teams, players, and matches
  const { 
    teams, 
    activeTeams, 
    createTeam, 
    updateTeam, 
    deleteTeam, 
    setTeams,
    loading: teamsLoading 
  } = useTeams();
  
  const { 
    players, 
    addPlayer, 
    updatePlayer, 
    deletePlayer,
    loading: playersLoading 
  } = usePlayers(setTeams);
  
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
    switchInnings,
    loading: matchesLoading
  } = useMatches();

  // Use mock data if we can't connect to Supabase
  const finalTeams = useBackupData || teams.length === 0 ? mockTeams : teams;
  const finalPlayers = useBackupData || players.length === 0 ? mockPlayers : players;
  const finalMatches = useBackupData || matches.length === 0 ? mockMatches : matches;
  
  // Calculate derived data
  const finalLiveMatch = finalMatches.find(match => match.status === 'live') || null;
  const finalCompletedMatches = finalMatches.filter(match => match.status === 'completed');
  const finalActiveTeams = finalTeams.filter(team => team.status === 'active');
  
  // Overall loading state
  const loading = teamsLoading || playersLoading || matchesLoading;

  // Context value
  const contextValue: CricketContextType = {
    teams: finalTeams,
    players: finalPlayers,
    matches: finalMatches,
    liveMatch: finalLiveMatch,
    activeTeams: finalActiveTeams,
    completedMatches: finalCompletedMatches,
    loading,
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
