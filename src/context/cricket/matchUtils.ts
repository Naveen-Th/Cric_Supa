
import { supabase } from '@/integrations/supabase/client';
import { Match } from '@/types/cricket';
import { toast } from '@/components/ui/use-toast';

export async function fetchMatches(): Promise<Match[]> {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('*, innings(*)');
      
    if (error) throw error;
    
    // Transform data to match our Match type
    const transformedMatches: Match[] = data.map(match => {
      const innings1 = match.innings?.find(i => i.innings_number === 1);
      const innings2 = match.innings?.find(i => i.innings_number === 2);
      
      return {
        id: match.id,
        team1Id: match.team1_id,
        team2Id: match.team2_id,
        date: match.date,
        venue: match.venue,
        status: match.status as 'upcoming' | 'live' | 'completed',
        tossWinnerId: match.toss_winner_id,
        tossChoice: match.toss_choice as 'bat' | 'bowl' | undefined,
        currentInnings: match.current_innings as 1 | 2 | undefined,
        totalOvers: match.total_overs,
        winnerId: match.winner_id,
        mvpId: match.mvp_id,
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
      };
    });
    
    return transformedMatches;
  } catch (error) {
    console.error('Error fetching matches:', error);
    toast({
      title: 'Error',
      description: 'Failed to fetch matches',
      variant: 'destructive',
    });
    return [];
  }
}

export async function createMatch(matchData: Omit<Match, 'id'>): Promise<Match> {
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
}

export async function updateMatch(match: Match): Promise<void> {
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
  } catch (error) {
    console.error('Error updating match:', error);
    toast({
      title: 'Error',
      description: 'Failed to update match',
      variant: 'destructive',
    });
    throw error;
  }
}

export async function deleteMatch(matchId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', matchId);
      
    if (error) throw error;
    
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
}
