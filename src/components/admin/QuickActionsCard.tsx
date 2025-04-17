
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Plus, Trophy } from 'lucide-react';
import AdminQuickAction from '@/components/admin/AdminQuickAction';
import PlayerQuickActions from '@/components/admin/PlayerQuickActions';

const QuickActionsCard = () => {
  return (
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
  );
};

export default QuickActionsCard;
