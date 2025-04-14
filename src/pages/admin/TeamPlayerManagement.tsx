
import { useParams, useNavigate } from 'react-router-dom';
import { useCricket } from '@/context/CricketContext';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import PlayerTeamAssignment from '@/components/admin/PlayerTeamAssignment';
import { Skeleton } from '@/components/ui/skeleton';

const TeamPlayerManagement = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { teams } = useCricket();
  
  const team = teamId ? teams.find(t => t.id === teamId) : undefined;
  
  const handleBack = () => {
    navigate('/admin/teams');
  };
  
  if (!teamId) {
    return (
      <MainLayout isAdmin>
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Invalid Team ID</h2>
          <Button onClick={handleBack}>Back to Teams</Button>
        </div>
      </MainLayout>
    );
  }
  
  if (!team) {
    return (
      <MainLayout isAdmin>
        <div className="space-y-4">
          <Button variant="outline" onClick={handleBack}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Manage Teams
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-8 w-48" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout isAdmin>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Manage Players for {team.name}</h1>
      </div>
      
      <PlayerTeamAssignment teamId={teamId} onBack={handleBack} />
    </MainLayout>
  );
};

export default TeamPlayerManagement;
