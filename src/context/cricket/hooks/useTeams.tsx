
import { useState, useEffect } from 'react';
import { Team } from '@/types/cricket';
import { fetchTeams, createTeam, updateTeam, deleteTeam } from '../teamUtils';
import { supabase } from '@/integrations/supabase/client';

export const useTeams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  
  // Derived state
  const activeTeams = teams.filter(team => team.status === 'active');

  // Load teams from Supabase
  useEffect(() => {
    const loadTeams = async () => {
      const teamsData = await fetchTeams();
      setTeams(teamsData);
    };
    
    loadTeams();
    
    // Set up real-time subscription
    const teamsSubscription = supabase
      .channel('teams-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, () => fetchTeams().then(setTeams))
      .subscribe();
      
    return () => {
      supabase.removeChannel(teamsSubscription);
    };
  }, []);

  // Team functions with state handling
  const handleCreateTeam = async (teamData: Omit<Team, 'id' | 'players'>) => {
    const newTeam = await createTeam(teamData);
    setTeams(prev => [...prev, newTeam]);
    return newTeam;
  };

  const handleUpdateTeam = async (team: Team) => {
    await updateTeam(team);
    setTeams(prev => prev.map((t) => (t.id === team.id ? team : t)));
  };

  const handleDeleteTeam = async (teamId: string) => {
    await deleteTeam(teamId, teams);
    setTeams(prev => prev.filter((t) => t.id !== teamId));
  };

  return {
    teams,
    activeTeams,
    createTeam: handleCreateTeam,
    updateTeam: handleUpdateTeam,
    deleteTeam: handleDeleteTeam,
    setTeams,
  };
};
