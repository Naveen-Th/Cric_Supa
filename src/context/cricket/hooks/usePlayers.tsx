
import { useState, useEffect } from 'react';
import { Player } from '@/types/cricket';
import { fetchPlayers, addPlayer, updatePlayer, deletePlayer } from '../playerUtils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const usePlayers = (setTeams: React.Dispatch<React.SetStateAction<any[]>>) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  // Load players from Supabase
  useEffect(() => {
    const loadPlayers = async () => {
      try {
        setLoading(true);
        const playersData = await fetchPlayers();
        setPlayers(playersData);
      } catch (error) {
        console.error('Error loading players:', error);
        toast({
          title: 'Error',
          description: 'Failed to load players data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadPlayers();
    
    // Set up real-time subscription
    const playersSubscription = supabase
      .channel('players-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, (payload) => {
        console.log('Players data changed:', payload);
        loadPlayers();
      })
      .subscribe();
      
    // Set up subscriptions for stats tables
    const battingStatsSubscription = supabase
      .channel('batting-stats-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'batting_stats' }, (payload) => {
        console.log('Batting stats changed:', payload);
        loadPlayers();
      })
      .subscribe();
      
    const bowlingStatsSubscription = supabase
      .channel('bowling-stats-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bowling_stats' }, (payload) => {
        console.log('Bowling stats changed:', payload);
        loadPlayers();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(playersSubscription);
      supabase.removeChannel(battingStatsSubscription);
      supabase.removeChannel(bowlingStatsSubscription);
    };
  }, []);

  // Player functions with state handling
  const handleAddPlayer = async (playerData: Omit<Player, 'id'>) => {
    try {
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

  const handleUpdatePlayer = async (player: Player) => {
    try {
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

  const handleDeletePlayer = async (playerId: string) => {
    try {
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

  return {
    players,
    loading,
    addPlayer: handleAddPlayer,
    updatePlayer: handleUpdatePlayer,
    deletePlayer: handleDeletePlayer,
  };
};
