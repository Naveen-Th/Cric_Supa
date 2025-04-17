
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Users } from 'lucide-react';
import TeamCard from '@/components/TeamCard';
import MatchCard from '@/components/MatchCard';
import { Team, Match } from '@/types/cricket';

interface TeamsAndMatchesTabsProps {
  activeTeams: Team[];
  completedMatches: Match[];
  teams: Team[];
}

const TeamsAndMatchesTabs = ({ activeTeams, completedMatches, teams }: TeamsAndMatchesTabsProps) => {
  return (
    <Tabs defaultValue="teams" className="w-full">
      <TabsList className="mb-4 w-full">
        <TabsTrigger value="teams" className="flex-1">
          <Users className="mr-2 h-4 w-4" />
          Active Teams
        </TabsTrigger>
        <TabsTrigger value="matches" className="flex-1">
          <Trophy className="mr-2 h-4 w-4" />
          Completed Matches
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="teams">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeTeams.map(team => (
            <TeamCard key={team.id} team={team} />
          ))}
          {activeTeams.length === 0 && (
            <div className="col-span-full text-center p-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No active teams available.</p>
            </div>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="matches">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {completedMatches.map(match => (
            <MatchCard key={match.id} match={match} teams={teams} />
          ))}
          {completedMatches.length === 0 && (
            <div className="col-span-full text-center p-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No completed matches available.</p>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default TeamsAndMatchesTabs;
