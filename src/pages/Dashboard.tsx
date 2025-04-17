
import { useCricket } from '@/context/CricketContext';
import MainLayout from '@/components/layout/MainLayout';
import LiveMatchSection from '@/components/dashboard/LiveMatchSection';
import NoLiveMatchSection from '@/components/dashboard/NoLiveMatchSection';
import PlayerStatsSection from '@/components/dashboard/PlayerStatsSection';
import UpcomingMatchesSection from '@/components/dashboard/UpcomingMatchesSection';
import TeamHighlightsSection from '@/components/dashboard/TeamHighlightsSection';
import TeamsAndMatchesTabs from '@/components/dashboard/TeamsAndMatchesTabs';

const Dashboard = () => {
  const { liveMatch, activeTeams, matches, teams, players, loading } = useCricket();
  
  const upcomingMatches = matches.filter(match => match.status === 'upcoming');
  const completedMatches = matches.filter(match => match.status === 'completed');
  
  const topTeams = activeTeams.slice(0, 3);
  
  const topBatsmen = players
    .filter(p => p.battingStats && p.battingStats.runs > 0)
    .sort((a, b) => (b.battingStats?.runs || 0) - (a.battingStats?.runs || 0))
    .slice(0, 5);
    
  const topBowlers = players
    .filter(p => p.bowlingStats && p.bowlingStats.wickets > 0)
    .sort((a, b) => (b.bowlingStats?.wickets || 0) - (a.bowlingStats?.wickets || 0))
    .slice(0, 5);
  
  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cricket-accent"></div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="grid grid-cols-1 gap-6">
        {liveMatch ? (
          <LiveMatchSection liveMatch={liveMatch} teams={teams} />
        ) : (
          <NoLiveMatchSection />
        )}
        
        <PlayerStatsSection topBatsmen={topBatsmen} topBowlers={topBowlers} />
        
        <UpcomingMatchesSection upcomingMatches={upcomingMatches} teams={teams} />
        
        <TeamHighlightsSection topTeams={topTeams} activeTeams={activeTeams} />
        
        <TeamsAndMatchesTabs 
          activeTeams={activeTeams} 
          completedMatches={completedMatches} 
          teams={teams} 
        />
      </div>
    </MainLayout>
  );
};

export default Dashboard;
