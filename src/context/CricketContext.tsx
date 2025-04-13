
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Team, Player, Match } from '@/types/cricket';
import { toast } from '@/components/ui/use-toast';

// Mock data
import { mockTeams, mockPlayers, mockMatches } from '@/data/mockData';

interface CricketContextType {
  teams: Team[];
  players: Player[];
  matches: Match[];
  liveMatch: Match | null;
  activeTeams: Team[];
  completedMatches: Match[];
  
  // Team functions
  createTeam: (team: Omit<Team, 'id' | 'players'>) => Team;
  updateTeam: (team: Team) => void;
  deleteTeam: (teamId: string) => void;
  
  // Player functions
  addPlayer: (player: Omit<Player, 'id'>) => Player;
  updatePlayer: (player: Player) => void;
  deletePlayer: (playerId: string) => void;
  
  // Match functions
  createMatch: (match: Omit<Match, 'id'>) => Match;
  updateMatch: (match: Match) => void;
  deleteMatch: (matchId: string) => void;
  startMatch: (matchId: string) => void;
  endMatch: (matchId: string, winnerId: string, mvpId: string) => void;
  
  // Live match functions
  updateScore: (matchId: string, runs: number, wickets?: number) => void;
  updateOvers: (matchId: string, overs: number) => void;
  switchInnings: (matchId: string) => void;
}

const CricketContext = createContext<CricketContextType | undefined>(undefined);

export const CricketProvider = ({ children }: { children: ReactNode }) => {
  const [teams, setTeams] = useState<Team[]>(mockTeams);
  const [players, setPlayers] = useState<Player[]>(mockPlayers);
  const [matches, setMatches] = useState<Match[]>(mockMatches);

  // Derived states
  const liveMatch = matches.find(match => match.status === 'live') || null;
  const activeTeams = teams.filter(team => team.status === 'active');
  const completedMatches = matches.filter(match => match.status === 'completed');

  // Team functions
  const createTeam = (teamData: Omit<Team, 'id' | 'players'>) => {
    const newTeam: Team = {
      ...teamData,
      id: `team-${Date.now()}`,
      players: [],
    };
    setTeams((prev) => [...prev, newTeam]);
    toast({
      title: 'Team Created',
      description: `${newTeam.name} has been created successfully.`,
    });
    return newTeam;
  };

  const updateTeam = (team: Team) => {
    setTeams((prev) => prev.map((t) => (t.id === team.id ? team : t)));
    toast({
      title: 'Team Updated',
      description: `${team.name} has been updated.`,
    });
  };

  const deleteTeam = (teamId: string) => {
    const teamToDelete = teams.find(team => team.id === teamId);
    if (!teamToDelete) return;
    
    setTeams((prev) => prev.filter((t) => t.id !== teamId));
    setPlayers((prev) => prev.filter((p) => p.teamId !== teamId));
    toast({
      title: 'Team Deleted',
      description: `${teamToDelete.name} has been deleted.`,
    });
  };

  // Player functions
  const addPlayer = (playerData: Omit<Player, 'id'>) => {
    const newPlayer: Player = {
      ...playerData,
      id: `player-${Date.now()}`,
      battingStats: { runs: 0, ballsFaced: 0, fours: 0, sixes: 0 },
      bowlingStats: { overs: 0, maidens: 0, runs: 0, wickets: 0 },
    };
    setPlayers((prev) => [...prev, newPlayer]);
    
    // Update the team's players array
    setTeams((prev) =>
      prev.map((team) =>
        team.id === playerData.teamId
          ? { ...team, players: [...team.players, newPlayer] }
          : team
      )
    );
    
    return newPlayer;
  };

  const updatePlayer = (player: Player) => {
    setPlayers((prev) => prev.map((p) => (p.id === player.id ? player : p)));
    
    // Update the player in their team
    setTeams((prev) =>
      prev.map((team) =>
        team.id === player.teamId
          ? {
              ...team,
              players: team.players.map((p) =>
                p.id === player.id ? player : p
              ),
            }
          : team
      )
    );
  };

  const deletePlayer = (playerId: string) => {
    const playerToDelete = players.find(player => player.id === playerId);
    if (!playerToDelete) return;
    
    setPlayers((prev) => prev.filter((p) => p.id !== playerId));
    
    // Remove player from team
    setTeams((prev) =>
      prev.map((team) =>
        team.id === playerToDelete.teamId
          ? {
              ...team,
              players: team.players.filter((p) => p.id !== playerId),
            }
          : team
      )
    );
  };

  // Match functions
  const createMatch = (matchData: Omit<Match, 'id'>) => {
    const newMatch: Match = {
      ...matchData,
      id: `match-${Date.now()}`,
    };
    setMatches((prev) => [...prev, newMatch]);
    toast({
      title: 'Match Created',
      description: 'The match has been created successfully.',
    });
    return newMatch;
  };

  const updateMatch = (match: Match) => {
    setMatches((prev) => prev.map((m) => (m.id === match.id ? match : m)));
  };

  const deleteMatch = (matchId: string) => {
    setMatches((prev) => prev.filter((m) => m.id !== matchId));
    toast({
      title: 'Match Deleted',
      description: 'The match has been deleted.',
    });
  };

  const startMatch = (matchId: string) => {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? {
              ...m,
              status: 'live',
              currentInnings: 1,
              innings1: {
                teamId: m.tossWinnerId === m.team1Id && m.tossChoice === 'bat' ? m.team1Id : m.team2Id,
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
    toast({
      title: 'Match Started',
      description: 'The match has started. Good luck to both teams!',
    });
  };

  const endMatch = (matchId: string, winnerId: string, mvpId: string) => {
    setMatches((prev) =>
      prev.map((m) =>
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
    toast({
      title: 'Match Completed',
      description: 'The match has been completed.',
    });
  };

  // Live match functions
  const updateScore = (matchId: string, runs: number, wickets: number = 0) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== matchId) return m;
        
        const currentInningsKey = m.currentInnings === 1 ? 'innings1' : 'innings2';
        const currentInnings = m[currentInningsKey];
        
        if (!currentInnings) return m;
        
        return {
          ...m,
          [currentInningsKey]: {
            ...currentInnings,
            runs: currentInnings.runs + runs,
            wickets: currentInnings.wickets + wickets,
          },
        };
      })
    );
  };

  const updateOvers = (matchId: string, overs: number) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== matchId) return m;
        
        const currentInningsKey = m.currentInnings === 1 ? 'innings1' : 'innings2';
        const currentInnings = m[currentInningsKey];
        
        if (!currentInnings) return m;
        
        return {
          ...m,
          [currentInningsKey]: {
            ...currentInnings,
            overs,
          },
        };
      })
    );
  };

  const switchInnings = (matchId: string) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== matchId) return m;
        
        // Only switch if we're in the first innings
        if (m.currentInnings !== 1) return m;
        
        // Set up the second innings
        return {
          ...m,
          currentInnings: 2,
          innings2: {
            teamId: m.innings1?.teamId === m.team1Id ? m.team2Id : m.team1Id,
            runs: 0,
            wickets: 0,
            overs: 0,
            battingOrder: [],
            extras: 0,
          },
        };
      })
    );
    toast({
      title: 'Innings Complete',
      description: 'First innings complete. Starting second innings.',
    });
  };

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
