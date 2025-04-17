import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCricket } from '@/context/CricketContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LiveMatchWrapper from '@/components/LiveMatchWrapper';
import LiveMatchChart from '@/components/LiveMatchChart';
import PlayerQuickActions from '@/components/admin/PlayerQuickActions';
import AdminQuickAction from '@/components/admin/AdminQuickAction';
import { Users, Plus, Trophy } from 'lucide-react';

const AdminDashboard = () => {
  const { liveMatch, teams, matches } = useCricket();
  
  return (
    <MainLayout isAdmin>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage cricket matches, teams and players.</p>
      </div>
      
      {/* Live Match Section (if exists) */}
      {liveMatch && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Live Match</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="lg:col-span-1">
              <LiveMatchWrapper 
                match={liveMatch} 
                teams={teams} 
                isAdmin={true} 
              />
            </div>
            
            <div className="lg:col-span-1">
              <LiveMatchChart match={liveMatch} teams={teams} />
            </div>
          </div>
        </div>
      )}
      
      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="teams">
            <TabsList className="mb-4">
              <TabsTrigger value="teams">Teams</TabsTrigger>
              <TabsTrigger value="matches">Matches</TabsTrigger>
              <TabsTrigger value="players">Players</TabsTrigger>
            </TabsList>
            
            <TabsContent value="teams">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <AdminQuickAction
                  icon={Users}
                  title="View All Teams"
                  description="See all registered teams"
                  onClick={() => {}}
                />
                <AdminQuickAction
                  icon={Plus}
                  title="Create New Team"
                  description="Add a new cricket team"
                  onClick={() => {}}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="matches">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <AdminQuickAction
                  icon={Trophy}
                  title="View All Matches"
                  description="See all scheduled matches"
                  onClick={() => {}}
                />
                <AdminQuickAction
                  icon={Plus}
                  title="Create New Match"
                  description="Schedule a new cricket match"
                  onClick={() => {}}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="players">
              <PlayerQuickActions />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{teams.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{matches.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {liveMatch ? 'Live Match in Progress' : 'No Live Matches'}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
