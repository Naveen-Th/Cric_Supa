
import { supabase } from '@/integrations/supabase/client';
import { Player } from '@/types/cricket';
import { toast } from '@/components/ui/use-toast';

export async function fetchPlayers(): Promise<Player[]> {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*, batting_stats(*), bowling_stats(*)');
      
    if (error) throw error;
    
    // Transform data to match our Player type
    const transformedPlayers: Player[] = data.map(player => ({
      id: player.id,
      name: player.name,
      role: player.role as 'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicket Keeper',
      team_id: player.team_id,
      teamId: player.team_id, // Add teamId alias for compatibility
      battingStats: player.batting_stats && player.batting_stats[0] ? {
        runs: player.batting_stats[0].runs || 0,
        ballsFaced: player.batting_stats[0].balls_faced || 0,
        fours: player.batting_stats[0].fours || 0,
        sixes: player.batting_stats[0].sixes || 0,
      } : undefined,
      bowlingStats: player.bowling_stats && player.bowling_stats[0] ? {
        overs: player.bowling_stats[0].overs || 0,
        maidens: player.bowling_stats[0].maidens || 0,
        runs: player.bowling_stats[0].runs || 0,
        wickets: player.bowling_stats[0].wickets || 0,
      } : undefined,
    }));
    
    return transformedPlayers;
  } catch (error) {
    console.error('Error fetching players:', error);
    toast({
      title: 'Error',
      description: 'Failed to fetch players',
      variant: 'destructive',
    });
    return [];
  }
}

export async function addPlayer(playerData: Omit<Player, 'id'>): Promise<Player> {
  try {
    const id = `player-${Date.now()}`;
    
    // Insert player
    const { error: playerError } = await supabase
      .from('players')
      .insert({
        id,
        name: playerData.name,
        role: playerData.role,
        team_id: playerData.team_id || playerData.teamId, // Handle both properties
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
      team_id: playerData.team_id || playerData.teamId || '',
      teamId: playerData.team_id || playerData.teamId,
      battingStats: { runs: 0, ballsFaced: 0, fours: 0, sixes: 0 },
      bowlingStats: { overs: 0, maidens: 0, runs: 0, wickets: 0 },
    };
    
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
}

export async function updatePlayer(player: Player): Promise<void> {
  try {
    // Update player
    const { error: playerError } = await supabase
      .from('players')
      .update({
        name: player.name,
        role: player.role,
        team_id: player.team_id || player.teamId,
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
  } catch (error) {
    console.error('Error updating player:', error);
    toast({
      title: 'Error',
      description: 'Failed to update player',
      variant: 'destructive',
    });
    throw error;
  }
}

export async function deletePlayer(playerId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', playerId);
      
    if (error) throw error;
    
  } catch (error) {
    console.error('Error deleting player:', error);
    toast({
      title: 'Error',
      description: 'Failed to delete player',
      variant: 'destructive',
    });
    throw error;
  }
}
