
import { useState } from 'react';
import { useCricket } from '@/context/CricketContext';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Play, Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';

const ManageMatches = () => {
  const { matches, teams, deleteMatch, startMatch } = useCricket();
  const navigate = useNavigate();
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<string | null>(null);
  
  const handleStartMatch = (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    
    if (!match) return;
    
    // Check if teams are ready (have at least 10 players)
    const team1 = teams.find(t => t.id === match.team1Id);
    const team2 = teams.find(t => t.id === match.team2Id);
    
    if (!team1 || !team2) {
      toast({
        title: 'Error',
        description: 'One or both teams do not exist.',
        variant: 'destructive',
      });
      return;
    }
    
    if (team1.players.length < 10 || team2.players.length < 10) {
      toast({
        title: 'Error',
        description: 'Both teams must have at least 10 players to start the match.',
        variant: 'destructive',
      });
      return;
    }
    
    // Check if toss has been done
    if (!match.tossWinnerId || !match.tossChoice) {
      toast({
        title: 'Error',
        description: 'Please complete the toss before starting the match.',
        variant: 'destructive',
      });
      return;
    }
    
    // Start the match
    startMatch(matchId);
    
    // Redirect to admin dashboard
    navigate('/admin');
  };
  
  const handleDeleteConfirm = () => {
    if (matchToDelete) {
      deleteMatch(matchToDelete);
      setShowDeleteDialog(false);
      setMatchToDelete(null);
    }
  };
  
  const upcomingMatches = matches.filter(match => match.status === 'upcoming');
  const liveMatches = matches.filter(match => match.status === 'live');
  const completedMatches = matches.filter(match => match.status === 'completed');
  
  return (
    <MainLayout isAdmin>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Matches</h1>
        <Button onClick={() => navigate('/admin/matches/create')}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Match
        </Button>
      </div>
      
      {liveMatches.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <span className="h-3 w-3 rounded-full bg-cricket-ball mr-2 animate-pulse"></span>
            Live Matches
          </h2>
          <Card>
            <CardContent className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teams</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {liveMatches.map(match => (
                    <TableRow key={match.id}>
                      <TableCell className="font-medium">
                        {teams.find(t => t.id === match.team1Id)?.name} vs {' '}
                        {teams.find(t => t.id === match.team2Id)?.name}
                      </TableCell>
                      <TableCell>{match.totalOvers} overs</TableCell>
                      <TableCell>{match.venue}</TableCell>
                      <TableCell>
                        <Badge className="bg-cricket-ball text-white">
                          LIVE
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate('/admin')}
                        >
                          Control Panel
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-6">
        <h2 className="text-xl font-bold">Upcoming Matches</h2>
        <Card>
          <CardContent className="p-4">
            {upcomingMatches.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Teams</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingMatches.map(match => (
                    <TableRow key={match.id}>
                      <TableCell>{new Date(match.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">
                        {teams.find(t => t.id === match.team1Id)?.name} vs {' '}
                        {teams.find(t => t.id === match.team2Id)?.name}
                      </TableCell>
                      <TableCell>{match.totalOvers} overs</TableCell>
                      <TableCell>{match.venue}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/matches/${match.id}`)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartMatch(match.id)}
                            disabled={!match.tossWinnerId || !match.tossChoice}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Start
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setMatchToDelete(match.id);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center p-8">
                <p className="text-gray-500">No upcoming matches available. Create one now!</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <h2 className="text-xl font-bold">Completed Matches</h2>
        <Card>
          <CardContent className="p-4">
            {completedMatches.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Teams</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedMatches.map(match => (
                    <TableRow key={match.id}>
                      <TableCell>{new Date(match.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">
                        {teams.find(t => t.id === match.team1Id)?.name} vs {' '}
                        {teams.find(t => t.id === match.team2Id)?.name}
                      </TableCell>
                      <TableCell>
                        {match.winnerId && (
                          <div className="text-sm">
                            {teams.find(t => t.id === match.winnerId)?.name} won
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/matches/${match.id}`)}
                          >
                            View
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setMatchToDelete(match.id);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center p-8">
                <p className="text-gray-500">No completed matches available.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Match</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this match? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default ManageMatches;
