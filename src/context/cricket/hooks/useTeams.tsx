
import { useState, useEffect } from 'react';
import { Team } from '@/types/cricket';
import { fetchTeams, createTeam, updateTeam, deleteTeam } from '../teamUtils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const useTeams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Derived state
  const activeTeams = teams.filter(team => team.status === 'active');

  // Load teams from Supabase
  useEffect(() => {
    const loadTeams = async () => {
      try {
        setLoading(true);
        const teamsData = await fetchTeams();
        setTeams(teamsData);
      } catch (error) {
        console.error('Error loading teams:', error);
        toast({
          title: 'Error',
          description: 'Failed to load teams data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadTeams();
    
    // Set up real-time subscription
    const teamsSubscription = supabase
      .channel('teams-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, (payload) => {
        console.log('Teams data changed:', payload);
        loadTeams();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(teamsSubscription);
    };
  }, []);

  // Team functions with state handling
  const handleCreateTeam = async (teamData: Omit<Team, 'id' | 'players'>) => {
    try {
      const newTeam = await createTeam(teamData);
      setTeams(prev => [...prev, newTeam]);
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

  const handleUpdateTeam = async (team: Team) => {
    try {
      await updateTeam(team);
      setTeams(prev => prev.map((t) => (t.id === team.id ? team : t)));
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

  const handleDeleteTeam = async (teamId: string) => {
    try {
      await deleteTeam(teamId, teams);
      setTeams(prev => prev.filter((t) => t.id !== teamId));
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

  return {
    teams,
    activeTeams,
    loading,
    createTeam: handleCreateTeam,
    updateTeam: handleUpdateTeam,
    deleteTeam: handleDeleteTeam,
    setTeams,
  };
};
