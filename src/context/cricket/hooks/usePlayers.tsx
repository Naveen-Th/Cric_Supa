
import { useState, useEffect } from 'react';
import { Player } from '@/types/cricket';
import { fetchPlayers, addPlayer, updatePlayer, deletePlayer } from '../playerUtils';
import { supabase } from '@/integrations/supabase/client';

export const usePlayers = (setTeams: React.Dispatch<React.SetStateAction<any[]>>) => {
  const [players, setPlayers] = useState<Player[]>([]);

  // Load players from Supabase
  useEffect(() => {
    const loadPlayers = async () => {
      const playersData = await fetchPlayers();
      setPlayers(playersData);
    };
    
    loadPlayers();
    
    // Set up real-time subscription
    const playersSubscription = supabase
      .channel('players-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, () => fetchPlayers().then(setPlayers))
      .subscribe();
      
    return () => {
      supabase.removeChannel(playersSubscription);
    };
  }, []);

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

  return {
    players,
    addPlayer: handleAddPlayer,
    updatePlayer: handleUpdatePlayer,
    deletePlayer: handleDeletePlayer,
  };
};
