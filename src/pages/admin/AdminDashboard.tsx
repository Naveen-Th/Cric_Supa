
import MainLayout from '@/components/layout/MainLayout';
import { useCricket } from '@/context/CricketContext';
import LiveMatchWrapper from '@/components/LiveMatchWrapper';
import LiveMatchChart from '@/components/LiveMatchChart';
import QuickActionsCard from '@/components/admin/QuickActionsCard';
import StatsSummaryCards from '@/components/admin/StatsSummaryCards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { liveMatch, teams, matches, completedMatches } = useCricket();
  const navigate = useNavigate();
  
  // Get most recent completed match if no live match
  const recentMatch = !liveMatch && completedMatches.length > 0 
    ? completedMatches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] 
    : null;
    
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
      
      {/* Recent Completed Match (if no live match) */}
      {!liveMatch && recentMatch && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Recent Completed Match</h2>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                {teams.find(t => t.id === recentMatch.team1Id)?.name} vs {teams.find(t => t.id === recentMatch.team2Id)?.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 items-center mb-3">
                <div className="text-right font-medium">{teams.find(t => t.id === recentMatch.team1Id)?.name}</div>
                <div className="text-center">vs</div>
                <div className="text-left font-medium">{teams.find(t => t.id === recentMatch.team2Id)?.name}</div>
                
                <div className="text-right">
                  {recentMatch.innings1?.runs || 0}/{recentMatch.innings1?.wickets || 0}
                  <span className="text-xs text-gray-500 ml-1">
                    ({recentMatch.innings1?.overs || 0})
                  </span>
                </div>
                <div className="text-center"></div>
                <div className="text-left">
                  {recentMatch.innings2?.runs || 0}/{recentMatch.innings2?.wickets || 0}
                  <span className="text-xs text-gray-500 ml-1">
                    ({recentMatch.innings2?.overs || 0})
                  </span>
                </div>
              </div>
              
              {recentMatch.winnerId && (
                <div className="flex justify-center mb-3">
                  <Badge className="bg-cricket-secondary text-white">
                    {teams.find(t => t.id === recentMatch.winnerId)?.name} won by {
                      recentMatch.innings1 && recentMatch.innings2 && recentMatch.winnerId === recentMatch.team2Id
                        ? `${10 - (recentMatch.innings2.wickets || 0)} wickets`
                        : `${(recentMatch.innings1?.runs || 0) - (recentMatch.innings2?.runs || 0)} runs`
                    }
                  </Badge>
                </div>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2"
                onClick={() => navigate(`/matches/${recentMatch.id}`)}
              >
                View Match Details
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Quick Actions */}
      <QuickActionsCard />
      
      {/* Stats Summary */}
      <StatsSummaryCards teams={teams} matches={matches} liveMatch={liveMatch} />
    </MainLayout>
  );
};

export default AdminDashboard;
