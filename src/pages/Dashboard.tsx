
import { useCricket } from '@/context/CricketContext';
import MainLayout from '@/components/layout/MainLayout';
import LiveMatchSection from '@/components/dashboard/LiveMatchSection';
import NoLiveMatchSection from '@/components/dashboard/NoLiveMatchSection';
import PlayerStatsSection from '@/components/dashboard/PlayerStatsSection';
import UpcomingMatchesSection from '@/components/dashboard/UpcomingMatchesSection';
import BattingStatsSection from '@/components/dashboard/BattingStatsSection';
import TeamsAndMatchesTabs from '@/components/dashboard/TeamsAndMatchesTabs';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { liveMatch, activeTeams, matches, teams, players, loading } = useCricket();
  
  const upcomingMatches = matches.filter(match => match.status === 'upcoming');
  const completedMatches = matches.filter(match => match.status === 'completed');
  
  const topBatsmen = players
    .filter(p => p.battingStats && p.battingStats.runs > 0)
    .sort((a, b) => (b.battingStats?.runs || 0) - (a.battingStats?.runs || 0))
    .slice(0, 5);
    
  const topBowlers = players
    .filter(p => p.bowlingStats && p.bowlingStats.wickets > 0)
    .sort((a, b) => (b.bowlingStats?.wickets || 0) - (a.bowlingStats?.wickets || 0))
    .slice(0, 5);
  
  
  return (
    <MainLayout>
      <div className="grid grid-cols-1 gap-6">
        {liveMatch ? (
          <>
            <LiveMatchSection liveMatch={liveMatch} teams={teams} isLoading={false} />
            <BattingStatsSection />
          </>
        ) : (
          <NoLiveMatchSection upcomingMatchCount={upcomingMatches.length} />
        )}
        
        <PlayerStatsSection topBatsmen={topBatsmen} topBowlers={topBowlers} />
        
        <UpcomingMatchesSection upcomingMatches={upcomingMatches} teams={teams} />
        
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
