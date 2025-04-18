
import { useState, useEffect } from 'react';
import { Match } from '@/types/cricket';
import { fetchMatches } from '../matchUtils';
import { useMatchHandlers } from './useMatchHandlers';
import { useMatchSubscriptions } from './useMatchSubscriptions';
import { toast } from '@/components/ui/use-toast';

export const useMatches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Derived states
  const liveMatch = matches.find(match => match.status === 'live') || null;
  const completedMatches = matches.filter(match => match.status === 'completed');

  // Load matches initially
  useEffect(() => {
    const loadMatches = async () => {
      try {
        setLoading(true);
        const matchesData = await fetchMatches();
        setMatches(matchesData);
      } catch (error) {
        console.error('Error loading matches:', error);
        toast({
          title: 'Error',
          description: 'Failed to load matches data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadMatches();
  }, []);
  
  // Set up real-time subscriptions
  useMatchSubscriptions(setMatches);
  
  // Get all match action handlers
  const matchHandlers = useMatchHandlers(matches, setMatches);

  return {
    matches,
    loading,
    liveMatch,
    completedMatches,
    ...matchHandlers
  };
};
