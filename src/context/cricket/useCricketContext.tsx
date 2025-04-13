
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchTeams, createTeam, updateTeam, deleteTeam } from './teamUtils';
import { fetchPlayers, addPlayer, updatePlayer, deletePlayer } from './playerUtils';
import { fetchMatches, createMatch, updateMatch, deleteMatch } from './matchUtils';
import { startMatch, endMatch, updateScore, updateOvers, switchInnings } from './liveMatchUtils';
import { CricketContextType } from './cricketTypes';
import { Team, Player, Match } from '@/types/cricket';
import { useAuth } from '../AuthContext';
import { supabase } from '@/integrations/supabase/client';

const CricketContext = createContext<CricketContextType | undefined>(undefined);

export const CricketProvider = ({ children }: { children: ReactNode }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const { isAdmin } = useAuth();

  // Derived states
  const liveMatch = matches.find(match => match.status === 'live') || null;
  const activeTeams = teams.filter(team => team.status === 'active');
  const completedMatches = matches.filter(match => match.status === 'completed');

  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      const teamsData = await fetchTeams();
      setTeams(teamsData);
      
      const playersData = await fetchPlayers();
      setPlayers(playersData);
      
      const matchesData = await fetchMatches();
      setMatches(matchesData);
    };
    
    loadData();
    
    // Set up real-time subscriptions
    const teamsSubscription = supabase
      .channel('teams-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, () => fetchTeams().then(setTeams))
      .subscribe();
      
    const playersSubscription = supabase
      .channel('players-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, () => fetchPlayers().then(setPlayers))
      .subscribe();
      
    const matchesSubscription = supabase
      .channel('matches-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => fetchMatches().then(setMatches))
      .subscribe();
      
    return () => {
      supabase.removeChannel(teamsSubscription);
      supabase.removeChannel(playersSubscription);
      supabase.removeChannel(matchesSubscription);
    };
  }, []);

  // Team functions with state handling
  const handleCreateTeam = async (teamData: Omit<Team, 'id' | 'players'>) => {
    const newTeam = await createTeam(teamData);
    setTeams(prev => [...prev, newTeam]);
    return newTeam;
  };

  const handleUpdateTeam = async (team: Team) => {
    await updateTeam(team);
    setTeams(prev => prev.map((t) => (t.id === team.id ? team : t)));
  };

  const handleDeleteTeam = async (teamId: string) => {
    await deleteTeam(teamId, teams);
    setTeams(prev => prev.filter((t) => t.id !== teamId));
    setPlayers(prev => prev.filter((p) => p.teamId !== teamId));
  };

  // Player functions with state handling
  const handleAddPlayer = async (playerData: Omit<Player, 'id'>) => {
    const newPlayer = await addPlayer(playerData);
    setPlayers(prev => [...prev, newPlayer]);
    
    // Update the team's players array
    setTeams(prev =>
      prev.map(team =>
        team.id === playerData.teamId
          ? { ...team, players: [...team.players, newPlayer] }
          : team
      )
    );
    
    return newPlayer;
  };

  const handleUpdatePlayer = async (player: Player) => {
    await updatePlayer(player);
    setPlayers(prev => prev.map(p => (p.id === player.id ? player : p)));
    
    // Update the player in their team
    setTeams(prev =>
      prev.map(team =>
        team.id === player.teamId
          ? {
              ...team,
              players: team.players.map(p =>
                p.id === player.id ? player : p
              ),
            }
          : team
      )
    );
  };

  const handleDeletePlayer = async (playerId: string) => {
    const playerToDelete = players.find(player => player.id === playerId);
    if (!playerToDelete) return;
    
    await deletePlayer(playerId);
    
    setPlayers(prev => prev.filter(p => p.id !== playerId));
    
    // Remove player from team
    setTeams(prev =>
      prev.map(team =>
        team.id === playerToDelete.teamId
          ? {
              ...team,
              players: team.players.filter(p => p.id !== playerId),
            }
          : team
      )
    );
  };

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

  // Context value
  const contextValue: CricketContextType = {
    teams,
    players,
    matches,
    liveMatch,
    activeTeams,
    completedMatches,
    createTeam: handleCreateTeam,
    updateTeam: handleUpdateTeam,
    deleteTeam: handleDeleteTeam,
    addPlayer: handleAddPlayer,
    updatePlayer: handleUpdatePlayer,
    deletePlayer: handleDeletePlayer,
    createMatch: handleCreateMatch,
    updateMatch: handleUpdateMatch,
    deleteMatch: handleDeleteMatch,
    startMatch: handleStartMatch,
    endMatch: handleEndMatch,
    updateScore: handleUpdateScore,
    updateOvers: handleUpdateOvers,
    switchInnings: handleSwitchInnings,
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
