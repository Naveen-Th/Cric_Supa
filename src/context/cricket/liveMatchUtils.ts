import { supabase } from '@/integrations/supabase/client';
import { Match } from '@/types/cricket';
import { toast } from '@/components/ui/use-toast';

export async function startMatch(matchId: string, matches: Match[]): Promise<void> {
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
}

export async function endMatch(matchId: string, winnerId: string, mvpId: string): Promise<void> {
  try {
    // Check if the match is already completed
    const { data: matchCheck } = await supabase
      .from('matches')
      .select('status')
      .eq('id', matchId)
      .single();
      
    if (matchCheck?.status === 'completed') {
      // Match is already completed, no need to update
      console.log('Match is already completed');
      return;
    }
    
    const { error } = await supabase
      .from('matches')
      .update({
        status: 'completed',
        winner_id: winnerId,
        mvp_id: mvpId,
      })
      .eq('id', matchId);
      
    if (error) throw error;
    
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
}

export async function updateScore(matchId: string, matches: Match[], runs: number, wickets: number = 0): Promise<void> {
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
  } catch (error) {
    console.error('Error updating score:', error);
    toast({
      title: 'Error',
      description: 'Failed to update score',
      variant: 'destructive',
    });
    throw error;
  }
}

export async function updateOvers(matchId: string, matches: Match[], overs: number): Promise<void> {
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
  } catch (error) {
    console.error('Error updating overs:', error);
    toast({
      title: 'Error',
      description: 'Failed to update overs',
      variant: 'destructive',
    });
    throw error;
  }
}

export async function switchInnings(matchId: string, matches: Match[]): Promise<void> {
  try {
    const match = matches.find(m => m.id === matchId);
    if (!match) {
      console.error('Match not found for switching innings');
      return;
    }
    
    if (match.currentInnings !== 1) {
      console.log('Not in first innings, cannot switch');
      return;
    }
    
    // Check if we've already switched to second innings
    const { data: inningsCheck } = await supabase
      .from('innings')
      .select('id')
      .eq('match_id', matchId)
      .eq('innings_number', 2)
      .maybeSingle();
      
    if (inningsCheck) {
      console.log('Second innings already exists');
      return;
    }
    
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
}
