
import { supabase } from '@/integrations/supabase/client';
import { Team, Player } from '@/types/cricket';
import { toast } from '@/components/ui/use-toast';

export async function fetchTeams(): Promise<Team[]> {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('*, players(*)');
      
    if (error) throw error;
    
    // Transform data to match our Team type
    const transformedTeams: Team[] = data.map(team => ({
      id: team.id,
      name: team.name,
      logo: team.logo || undefined,
      status: team.status as 'active' | 'inactive',
      players: (team.players || []).map(player => ({
        id: player.id,
        name: player.name,
        role: player.role as 'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicket Keeper',
        teamId: player.team_id,
      })),
    }));
    
    return transformedTeams;
  } catch (error) {
    console.error('Error fetching teams:', error);
    toast({
      title: 'Error',
      description: 'Failed to fetch teams',
      variant: 'destructive',
    });
    return [];
  }
}

export async function createTeam(teamData: Omit<Team, 'id' | 'players'>): Promise<Team> {
  try {
    const id = `team-${Date.now()}`;
    
    const { error } = await supabase
      .from('teams')
      .insert({
        id,
        name: teamData.name,
        logo: teamData.logo,
        status: teamData.status,
      });
      
    if (error) throw error;
    
    const newTeam: Team = {
      id,
      name: teamData.name,
      logo: teamData.logo,
      status: teamData.status,
      players: [],
    };
    
    toast({
      title: 'Team Created',
      description: `${newTeam.name} has been created successfully.`,
    });
    
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
}

export async function updateTeam(team: Team): Promise<void> {
  try {
    const { error } = await supabase
      .from('teams')
      .update({
        name: team.name,
        logo: team.logo,
        status: team.status,
      })
      .eq('id', team.id);
      
    if (error) throw error;
    
    toast({
      title: 'Team Updated',
      description: `${team.name} has been updated.`,
    });
  } catch (error) {
    console.error('Error updating team:', error);
    toast({
      title: 'Error',
      description: 'Failed to update team',
      variant: 'destructive',
    });
    throw error;
  }
}

export async function deleteTeam(teamId: string, teams: Team[]): Promise<void> {
  try {
    const teamToDelete = teams.find(team => team.id === teamId);
    if (!teamToDelete) return;
    
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);
      
    if (error) throw error;
    
    toast({
      title: 'Team Deleted',
      description: `${teamToDelete.name} has been deleted.`,
    });
  } catch (error) {
    console.error('Error deleting team:', error);
    toast({
      title: 'Error',
      description: 'Failed to delete team',
      variant: 'destructive',
    });
    throw error;
  }
}
