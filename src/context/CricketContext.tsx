
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Team, Player, Match } from '@/types/cricket';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface CricketContextType {
  teams: Team[];
  players: Player[];
  matches: Match[];
  liveMatch: Match | null;
  activeTeams: Team[];
  completedMatches: Match[];
  
  // Team functions
  createTeam: (team: Omit<Team, 'id' | 'players'>) => Promise<Team>;
  updateTeam: (team: Team) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  
  // Player functions
  addPlayer: (player: Omit<Player, 'id'>) => Promise<Player>;
  updatePlayer: (player: Player) => Promise<void>;
  deletePlayer: (playerId: string) => Promise<void>;
  
  // Match functions
  createMatch: (match: Omit<Match, 'id'>) => Promise<Match>;
  updateMatch: (match: Match) => Promise<void>;
  deleteMatch: (matchId: string) => Promise<void>;
  startMatch: (matchId: string) => Promise<void>;
  endMatch: (matchId: string, winnerId: string, mvpId: string) => Promise<void>;
  
  // Live match functions
  updateScore: (matchId: string, runs: number, wickets?: number) => Promise<void>;
  updateOvers: (matchId: string, overs: number) => Promise<void>;
  switchInnings: (matchId: string) => Promise<void>;
}

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
    fetchTeams();
    fetchPlayers();
    fetchMatches();
    
    // Set up real-time subscriptions
    const teamsSubscription = supabase
      .channel('teams-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, () => fetchTeams())
      .subscribe();
      
    const playersSubscription = supabase
      .channel('players-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, () => fetchPlayers())
      .subscribe();
      
    const matchesSubscription = supabase
      .channel('matches-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => fetchMatches())
      .subscribe();
      
    return () => {
      supabase.removeChannel(teamsSubscription);
      supabase.removeChannel(playersSubscription);
      supabase.removeChannel(matchesSubscription);
    };
  }, []);
  
  // Fetch functions
  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*');
        
      if (error) throw error;
      
      // We need to fetch players for each team to populate the players array
      const teamsWithPlayers: Team[] = await Promise.all(
        data.map(async (team) => {
          const { data: teamPlayers, error: playersError } = await supabase
            .from('players')
            .select('*')
            .eq('team_id', team.id);
            
          if (playersError) throw playersError;
          
          return {
            ...team,
            players: teamPlayers || []
          } as Team;
        })
      );
      
      setTeams(teamsWithPlayers);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch teams',
        variant: 'destructive',
      });
    }
  };
  
  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select(`
          *,
          batting_stats!inner(*),
          bowling_stats!inner(*)
        `);
        
      if (error) throw error;
      
      // Transform data to match our Player type
      const transformedPlayers: Player[] = data.map(player => ({
        id: player.id,
        name: player.name,
        role: player.role as any,
        teamId: player.team_id,
        battingStats: {
          runs: player.batting_stats?.runs || 0,
          ballsFaced: player.batting_stats?.balls_faced || 0,
          fours: player.batting_stats?.fours || 0,
          sixes: player.batting_stats?.sixes || 0,
        },
        bowlingStats: {
          overs: player.bowling_stats?.overs || 0,
          maidens: player.bowling_stats?.maidens || 0,
          runs: player.bowling_stats?.runs || 0,
          wickets: player.bowling_stats?.wickets || 0,
        }
      }));
      
      setPlayers(transformedPlayers);
    } catch (error) {
      console.error('Error fetching players:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch players',
        variant: 'destructive',
      });
    }
  };
  
  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*');
        
      if (error) throw error;
      
      // We need to fetch innings data for each match
      const matchesWithInnings: Match[] = await Promise.all(
        data.map(async (match) => {
          const { data: innings, error: inningsError } = await supabase
            .from('innings')
            .select('*')
            .eq('match_id', match.id)
            .order('innings_number', { ascending: true });
            
          if (inningsError) throw inningsError;
          
          const innings1 = innings?.find(i => i.innings_number === 1);
          const innings2 = innings?.find(i => i.innings_number === 2);
          
          return {
            ...match,
            innings1: innings1 ? {
              teamId: innings1.team_id,
              runs: innings1.runs,
              wickets: innings1.wickets,
              overs: innings1.overs,
              battingOrder: [],
              extras: innings1.extras,
            } : undefined,
            innings2: innings2 ? {
              teamId: innings2.team_id,
              runs: innings2.runs,
              wickets: innings2.wickets,
              overs: innings2.overs,
              battingOrder: [],
              extras: innings2.extras,
            } : undefined,
          } as Match;
        })
      );
      
      setMatches(matchesWithInnings);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch matches',
        variant: 'destructive',
      });
    }
  };

  // Team functions
  const createTeam = async (teamData: Omit<Team, 'id' | 'players'>) => {
    try {
      const id = `team-${Date.now()}`;
      
      const { error } = await supabase
        .from('teams')
        .insert({
          id,
          name: teamData.name,
          logo: teamData.logo,
          status: teamData.status,
        });
        
      if (error) throw error;
      
      const newTeam: Team = {
        id,
        name: teamData.name,
        logo: teamData.logo,
        status: teamData.status,
        players: [],
      };
      
      setTeams(prev => [...prev, newTeam]);
      
      toast({
        title: 'Team Created',
        description: `${newTeam.name} has been created successfully.`,
      });
      
      return newTeam;
    } catch (error) {
      console.error('Error creating team:', error);
      toast({
        title: 'Error',
        description: 'Failed to create team',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateTeam = async (team: Team) => {
    try {
      const { error } = await supabase
        .from('teams')
        .update({
          name: team.name,
          logo: team.logo,
          status: team.status,
        })
        .eq('id', team.id);
        
      if (error) throw error;
      
      setTeams(prev => prev.map((t) => (t.id === team.id ? team : t)));
      
      toast({
        title: 'Team Updated',
        description: `${team.name} has been updated.`,
      });
    } catch (error) {
      console.error('Error updating team:', error);
      toast({
        title: 'Error',
        description: 'Failed to update team',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteTeam = async (teamId: string) => {
    try {
      const teamToDelete = teams.find(team => team.id === teamId);
      if (!teamToDelete) return;
      
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);
        
      if (error) throw error;
      
      setTeams(prev => prev.filter((t) => t.id !== teamId));
      setPlayers(prev => prev.filter((p) => p.teamId !== teamId));
      
      toast({
        title: 'Team Deleted',
        description: `${teamToDelete.name} has been deleted.`,
      });
    } catch (error) {
      console.error('Error deleting team:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete team',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Player functions
  const addPlayer = async (playerData: Omit<Player, 'id'>) => {
    try {
      const id = `player-${Date.now()}`;
      
      // Insert player
      const { error: playerError } = await supabase
        .from('players')
        .insert({
          id,
          name: playerData.name,
          role: playerData.role,
          team_id: playerData.teamId,
        });
        
      if (playerError) throw playerError;
      
      // Insert batting stats
      const { error: battingError } = await supabase
        .from('batting_stats')
        .insert({
          player_id: id,
          runs: 0,
          balls_faced: 0,
          fours: 0,
          sixes: 0,
        });
        
      if (battingError) throw battingError;
      
      // Insert bowling stats
      const { error: bowlingError } = await supabase
        .from('bowling_stats')
        .insert({
          player_id: id,
          overs: 0,
          maidens: 0,
          runs: 0,
          wickets: 0,
        });
        
      if (bowlingError) throw bowlingError;
      
      const newPlayer: Player = {
        id,
        name: playerData.name,
        role: playerData.role,
        teamId: playerData.teamId,
        battingStats: { runs: 0, ballsFaced: 0, fours: 0, sixes: 0 },
        bowlingStats: { overs: 0, maidens: 0, runs: 0, wickets: 0 },
      };
      
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
    } catch (error) {
      console.error('Error adding player:', error);
      toast({
        title: 'Error',
        description: 'Failed to add player',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updatePlayer = async (player: Player) => {
    try {
      // Update player
      const { error: playerError } = await supabase
        .from('players')
        .update({
          name: player.name,
          role: player.role,
          team_id: player.teamId,
        })
        .eq('id', player.id);
        
      if (playerError) throw playerError;
      
      // Update batting stats
      if (player.battingStats) {
        const { error: battingError } = await supabase
          .from('batting_stats')
          .update({
            runs: player.battingStats.runs,
            balls_faced: player.battingStats.ballsFaced,
            fours: player.battingStats.fours,
            sixes: player.battingStats.sixes,
          })
          .eq('player_id', player.id);
          
        if (battingError) throw battingError;
      }
      
      // Update bowling stats
      if (player.bowlingStats) {
        const { error: bowlingError } = await supabase
          .from('bowling_stats')
          .update({
            overs: player.bowlingStats.overs,
            maidens: player.bowlingStats.maidens,
            runs: player.bowlingStats.runs,
            wickets: player.bowlingStats.wickets,
          })
          .eq('player_id', player.id);
          
        if (bowlingError) throw bowlingError;
      }
      
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
    } catch (error) {
      console.error('Error updating player:', error);
      toast({
        title: 'Error',
        description: 'Failed to update player',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deletePlayer = async (playerId: string) => {
    try {
      const playerToDelete = players.find(player => player.id === playerId);
      if (!playerToDelete) return;
      
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId);
        
      if (error) throw error;
      
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
    } catch (error) {
      console.error('Error deleting player:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete player',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Match functions
  const createMatch = async (matchData: Omit<Match, 'id'>) => {
    try {
      const id = `match-${Date.now()}`;
      
      const { error } = await supabase
        .from('matches')
        .insert({
          id,
          team1_id: matchData.team1Id,
          team2_id: matchData.team2Id,
          date: matchData.date,
          venue: matchData.venue,
          status: matchData.status,
          toss_winner_id: matchData.tossWinnerId,
          toss_choice: matchData.tossChoice,
          current_innings: matchData.currentInnings,
          total_overs: matchData.totalOvers,
          winner_id: matchData.winnerId,
          mvp_id: matchData.mvpId,
        });
        
      if (error) throw error;
      
      const newMatch: Match = {
        id,
        ...matchData,
      };
      
      setMatches(prev => [...prev, newMatch]);
      
      toast({
        title: 'Match Created',
        description: 'The match has been created successfully.',
      });
      
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

  const updateMatch = async (match: Match) => {
    try {
      const { error } = await supabase
        .from('matches')
        .update({
          team1_id: match.team1Id,
          team2_id: match.team2Id,
          date: match.date,
          venue: match.venue,
          status: match.status,
          toss_winner_id: match.tossWinnerId,
          toss_choice: match.tossChoice,
          current_innings: match.currentInnings,
          total_overs: match.totalOvers,
          winner_id: match.winnerId,
          mvp_id: match.mvpId,
        })
        .eq('id', match.id);
        
      if (error) throw error;
      
      // Update innings if they exist
      if (match.innings1) {
        const { data: innings1Data, error: innings1CheckError } = await supabase
          .from('innings')
          .select('id')
          .eq('match_id', match.id)
          .eq('innings_number', 1)
          .single();
          
        if (innings1CheckError && innings1CheckError.code !== 'PGRST116') {
          throw innings1CheckError;
        }
        
        if (innings1Data) {
          // Update existing innings
          const { error: innings1UpdateError } = await supabase
            .from('innings')
            .update({
              team_id: match.innings1.teamId,
              runs: match.innings1.runs,
              wickets: match.innings1.wickets,
              overs: match.innings1.overs,
              extras: match.innings1.extras,
            })
            .eq('id', innings1Data.id);
            
          if (innings1UpdateError) throw innings1UpdateError;
        } else {
          // Create new innings
          const { error: innings1InsertError } = await supabase
            .from('innings')
            .insert({
              match_id: match.id,
              team_id: match.innings1.teamId,
              innings_number: 1,
              runs: match.innings1.runs,
              wickets: match.innings1.wickets,
              overs: match.innings1.overs,
              extras: match.innings1.extras,
            });
            
          if (innings1InsertError) throw innings1InsertError;
        }
      }
      
      if (match.innings2) {
        const { data: innings2Data, error: innings2CheckError } = await supabase
          .from('innings')
          .select('id')
          .eq('match_id', match.id)
          .eq('innings_number', 2)
          .single();
          
        if (innings2CheckError && innings2CheckError.code !== 'PGRST116') {
          throw innings2CheckError;
        }
        
        if (innings2Data) {
          // Update existing innings
          const { error: innings2UpdateError } = await supabase
            .from('innings')
            .update({
              team_id: match.innings2.teamId,
              runs: match.innings2.runs,
              wickets: match.innings2.wickets,
              overs: match.innings2.overs,
              extras: match.innings2.extras,
            })
            .eq('id', innings2Data.id);
            
          if (innings2UpdateError) throw innings2UpdateError;
        } else {
          // Create new innings
          const { error: innings2InsertError } = await supabase
            .from('innings')
            .insert({
              match_id: match.id,
              team_id: match.innings2.teamId,
              innings_number: 2,
              runs: match.innings2.runs,
              wickets: match.innings2.wickets,
              overs: match.innings2.overs,
              extras: match.innings2.extras,
            });
            
          if (innings2InsertError) throw innings2InsertError;
        }
      }
      
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

  const deleteMatch = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId);
        
      if (error) throw error;
      
      setMatches(prev => prev.filter(m => m.id !== matchId));
      
      toast({
        title: 'Match Deleted',
        description: 'The match has been deleted.',
      });
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

  const startMatch = async (matchId: string) => {
    try {
      const match = matches.find(m => m.id === matchId);
      if (!match) return;
      
      const firstInningsTeamId = match.tossWinnerId === match.team1Id && match.tossChoice === 'bat' 
                                ? match.team1Id 
                                : match.team2Id;
      
      // Update match status
      const { error: matchError } = await supabase
        .from('matches')
        .update({
          status: 'live',
          current_innings: 1,
        })
        .eq('id', matchId);
        
      if (matchError) throw matchError;
      
      // Create the first innings
      const { error: inningsError } = await supabase
        .from('innings')
        .insert({
          match_id: matchId,
          team_id: firstInningsTeamId,
          innings_number: 1,
          runs: 0,
          wickets: 0,
          overs: 0,
          extras: 0,
        });
        
      if (inningsError) throw inningsError;
      
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
      
      toast({
        title: 'Match Started',
        description: 'The match has started. Good luck to both teams!',
      });
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

  const endMatch = async (matchId: string, winnerId: string, mvpId: string) => {
    try {
      const { error } = await supabase
        .from('matches')
        .update({
          status: 'completed',
          winner_id: winnerId,
          mvp_id: mvpId,
        })
        .eq('id', matchId);
        
      if (error) throw error;
      
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
      
      toast({
        title: 'Match Completed',
        description: 'The match has been completed.',
      });
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

  // Live match functions
  const updateScore = async (matchId: string, runs: number, wickets: number = 0) => {
    try {
      const match = matches.find(m => m.id === matchId);
      if (!match) return;
      
      const currentInningsNumber = match.currentInnings;
      const currentInnings = currentInningsNumber === 1 ? match.innings1 : match.innings2;
      
      if (!currentInnings) return;
      
      const { data: inningsData, error: inningsError } = await supabase
        .from('innings')
        .select('id')
        .eq('match_id', matchId)
        .eq('innings_number', currentInningsNumber)
        .single();
        
      if (inningsError) throw inningsError;
      
      const { error: updateError } = await supabase
        .from('innings')
        .update({
          runs: (currentInnings.runs || 0) + runs,
          wickets: (currentInnings.wickets || 0) + wickets,
        })
        .eq('id', inningsData.id);
        
      if (updateError) throw updateError;
      
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

  const updateOvers = async (matchId: string, overs: number) => {
    try {
      const match = matches.find(m => m.id === matchId);
      if (!match) return;
      
      const currentInningsNumber = match.currentInnings;
      
      const { data: inningsData, error: inningsError } = await supabase
        .from('innings')
        .select('id')
        .eq('match_id', matchId)
        .eq('innings_number', currentInningsNumber)
        .single();
        
      if (inningsError) throw inningsError;
      
      const { error: updateError } = await supabase
        .from('innings')
        .update({
          overs,
        })
        .eq('id', inningsData.id);
        
      if (updateError) throw updateError;
      
      setMatches(prev =>
        prev.map(m => {
          if (m.id !== matchId) return m;
          
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

  const switchInnings = async (matchId: string) => {
    try {
      const match = matches.find(m => m.id === matchId);
      if (!match || match.currentInnings !== 1) return;
      
      const secondInningsTeamId = match.innings1?.teamId === match.team1Id ? match.team2Id : match.team1Id;
      
      // Update match
      const { error: matchError } = await supabase
        .from('matches')
        .update({
          current_innings: 2,
        })
        .eq('id', matchId);
        
      if (matchError) throw matchError;
      
      // Create second innings
      const { error: inningsError } = await supabase
        .from('innings')
        .insert({
          match_id: matchId,
          team_id: secondInningsTeamId,
          innings_number: 2,
          runs: 0,
          wickets: 0,
          overs: 0,
          extras: 0,
        });
        
      if (inningsError) throw inningsError;
      
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
      
      toast({
        title: 'Innings Complete',
        description: 'First innings complete. Starting second innings.',
      });
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
