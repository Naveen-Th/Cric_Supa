
import { useCricket } from '@/context/CricketContext';
import { Match, Team } from '@/types/cricket';
import { BattingPartnership } from '@/context/cricket/cricketTypes';
import LiveMatch from './LiveMatch';
import LiveMatchControl from './admin/LiveMatchControl';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LiveMatchWrapperProps {
  match: Match;
  teams: Team[];
  isAdmin?: boolean;
}

const LiveMatchWrapper = ({ match, teams, isAdmin = false }: LiveMatchWrapperProps) => {
  const [striker, setStriker] = useState<string | null>(null);
  const [nonStriker, setNonStriker] = useState<string | null>(null);
  
  useEffect(() => {
    // Function to fetch the current batting partnership from the database
    const fetchBattingPartnership = async () => {
      try {
        // Since batting_partnerships is a custom table, we need to use a different query approach
        const { data, error } = await supabase
          .from('batting_partnerships')
          .select('*')
          .eq('match_id', match.id)
          .eq('innings_number', match.currentInnings)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (error) {
          console.error('Error fetching batting partnership:', error);
          // If no partnership found, check localStorage as fallback
          const state = localStorage.getItem(`cricket_match_state_${match.id}`);
          if (state) {
            const { striker: storedStriker, nonStriker: storedNonStriker } = JSON.parse(state);
            setStriker(storedStriker);
            setNonStriker(storedNonStriker);
          }
          return;
        }
        
        if (data && data.length > 0) {
          const partnership = data[0] as BattingPartnership;
          setStriker(partnership.striker_id);
          setNonStriker(partnership.non_striker_id);
        }
      } catch (error) {
        console.error('Error in fetchBattingPartnership:', error);
      }
    };

    // Initial fetch
    fetchBattingPartnership();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('batting-partnership-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'batting_partnerships',
          filter: `match_id=eq.${match.id}` 
        }, 
        (payload) => {
          console.log('Batting partnership updated:', payload);
          if (payload.new && payload.new.innings_number === match.currentInnings) {
            // Cast the payload to BattingPartnership type
            const partnership = payload.new as BattingPartnership;
            setStriker(partnership.striker_id);
            setNonStriker(partnership.non_striker_id);
          }
        }
      )
      .subscribe();
    
    // Fallback listener for localStorage changes (legacy support)
    const updatePlayers = () => {
      const state = localStorage.getItem(`cricket_match_state_${match.id}`);
      if (state) {
        const { striker: newStriker, nonStriker: newNonStriker } = JSON.parse(state);
        setStriker(newStriker);
        setNonStriker(newNonStriker);
      }
    };
    
    window.addEventListener('storage', updatePlayers);
    
    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('storage', updatePlayers);
    };
  }, [match.id, match.currentInnings]);

  return (
    <div className="space-y-6">
      <LiveMatch 
        match={match} 
        teams={teams} 
        isAdmin={isAdmin}
        striker={striker}
        nonStriker={nonStriker}
      />
      {isAdmin && (
        <LiveMatchControl match={match} teams={teams} />
      )}
    </div>
  );
};

export default LiveMatchWrapper;
