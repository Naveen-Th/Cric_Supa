
import MainLayout from '@/components/layout/MainLayout';
import { useCricket } from '@/context/CricketContext';
import LiveMatchWrapper from '@/components/LiveMatchWrapper';
import LiveMatchChart from '@/components/LiveMatchChart';
import QuickActionsCard from '@/components/admin/QuickActionsCard';
import StatsSummaryCards from '@/components/admin/StatsSummaryCards';

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
      <QuickActionsCard />
      
      {/* Stats Summary */}
      <StatsSummaryCards teams={teams} matches={matches} liveMatch={liveMatch} />
    </MainLayout>
  );
};

export default AdminDashboard;
