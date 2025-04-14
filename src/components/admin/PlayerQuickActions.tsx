
import { UserPlus, Users, UserCog } from 'lucide-react';
import { useCricket } from '@/context/CricketContext';
import { useNavigate } from 'react-router-dom';
import AdminQuickAction from './AdminQuickAction';

const PlayerQuickActions = () => {
  const navigate = useNavigate();
  const { teams } = useCricket();
  
  // Only get active teams
  const activeTeams = teams.filter(team => team.status === 'active');
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <AdminQuickAction
        icon={Users}
        title="View All Players"
        description="See all registered players"
        onClick={() => navigate('/admin/players')}
      />
      
      <AdminQuickAction
        icon={UserPlus}
        title="Add New Player"
        description="Create a new player profile"
        onClick={() => navigate('/admin/player-management')}
      />
      
      <AdminQuickAction
        icon={UserCog}
        title="Manage Team Players"
        description="Assign players to teams"
        onClick={() => {
          if (activeTeams.length > 0) {
            navigate(`/admin/teams/${activeTeams[0]?.id}/players`);
          } else {
            navigate('/admin/teams');
          }
        }}
      />
    </div>
  );
};

export default PlayerQuickActions;
