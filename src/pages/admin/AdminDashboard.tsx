
import { useCricket } from '@/context/CricketContext';
import MainLayout from '@/components/layout/MainLayout';
import LiveMatch from '@/components/LiveMatch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Users, Trophy, Calendar } from 'lucide-react';

const AdminDashboard = () => {
  const { liveMatch, teams, matches, players } = useCricket();
  const navigate = useNavigate();
  
  const activeTeams = teams.filter(team => team.status === 'active');
  const upcomingMatches = matches.filter(match => match.status === 'upcoming');
  const completedMatches = matches.filter(match => match.status === 'completed');
  
  return (
    <MainLayout isAdmin>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold">{teams.length}</div>
              <Users className="h-8 w-8 text-cricket-pitch opacity-80" />
            </div>
            <div className="text-xs text-gray-500 mt-1">{activeTeams.length} active teams</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold">{players.length}</div>
              <Users className="h-8 w-8 text-cricket-secondary opacity-80" />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {players.filter(p => p.role === 'Batsman').length} batsmen, {' '}
              {players.filter(p => p.role === 'Bowler').length} bowlers
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold">{matches.length}</div>
              <Trophy className="h-8 w-8 text-cricket-accent opacity-80" />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {completedMatches.length} completed, {upcomingMatches.length} upcoming
              {liveMatch ? ', 1 live' : ''}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Quick Actions</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col items-center justify-center gap-2"
            onClick={() => navigate('/admin/teams/create')}
          >
            <PlusCircle className="h-6 w-6" />
            <span>Create Team</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col items-center justify-center gap-2"
            onClick={() => navigate('/admin/matches/create')}
          >
            <Trophy className="h-6 w-6" />
            <span>Create Match</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col items-center justify-center gap-2"
            onClick={() => navigate('/admin/players')}
          >
            <Users className="h-6 w-6" />
            <span>Manage Players</span>
          </Button>
        </div>
      </div>
      
      {liveMatch && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <span className="h-3 w-3 rounded-full bg-cricket-ball mr-2 animate-pulse"></span>
              Live Match Control
            </h2>
          </div>
          <LiveMatch match={liveMatch} teams={teams} isAdmin={true} />
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Upcoming Matches</h2>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => navigate('/admin/matches')}
          >
            View All
          </Button>
        </div>
        
        {upcomingMatches.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Teams</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingMatches.slice(0, 5).map(match => (
                    <TableRow key={match.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {new Date(match.date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {teams.find(t => t.id === match.team1Id)?.name} vs {' '}
                        {teams.find(t => t.id === match.team2Id)?.name}
                      </TableCell>
                      <TableCell>{match.venue}</TableCell>
                      <TableCell>{match.totalOvers} overs</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/admin/matches/${match.id}`)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No upcoming matches. Create one now!</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;

// Import the Table components
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
