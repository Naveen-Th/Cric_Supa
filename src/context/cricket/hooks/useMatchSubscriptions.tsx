
import { useEffect } from 'react';
import { Match } from '@/types/cricket';
import { supabase } from '@/integrations/supabase/client';
import { fetchMatches } from '../matchUtils';

export const useMatchSubscriptions = (
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>
) => {
  useEffect(() => {
    const loadMatches = async () => {
      const matchesData = await fetchMatches();
      setMatches(matchesData);
    };
    
    // Set up real-time subscription for matches
    const matchesSubscription = supabase
      .channel('matches-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, (payload) => {
        console.log('Matches data changed:', payload);
        loadMatches();
      })
      .subscribe();
    
    // Set up real-time subscription for innings
    const inningsSubscription = supabase
      .channel('innings-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'innings' }, (payload) => {
        console.log('Innings data changed:', payload);
        loadMatches(); // Reload all matches when innings data changes
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(matchesSubscription);
      supabase.removeChannel(inningsSubscription);
    };
  }, [setMatches]);
};
