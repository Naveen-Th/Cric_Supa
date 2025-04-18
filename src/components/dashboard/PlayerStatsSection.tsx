
import { useNavigate } from 'react-router-dom';
import { BarChart4, ArrowRight, TrendingUp, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatisticsTable from '@/components/StatisticsTable';
import { Player } from '@/types/cricket';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PlayerStatsSectionProps {
  topBatsmen: Player[];
  topBowlers: Player[];
}

const PlayerStatsSection = ({ topBatsmen, topBowlers }: PlayerStatsSectionProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  return (
    <Card className="mb-8 shadow-md border-2 border-cricket-pitch/10">
      <CardHeader className="bg-gradient-to-br from-cricket-primary/5 to-cricket-secondary/5">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold flex items-center">
            <BarChart4 className="mr-2 h-5 w-5 text-cricket-secondary" />
            Player Statistics
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1 hover:bg-cricket-primary/10 text-cricket-primary"
            onClick={() => navigate('/statistics')}
          >
            View all stats <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`${isMobile ? "order-1" : ""} border rounded-lg p-4 shadow-sm bg-card`}>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-cricket-primary" />
              <h3 className="text-lg font-semibold">Top Batsmen</h3>
            </div>
            <StatisticsTable 
              title="" 
              players={topBatsmen} 
              type="batting"
            />
          </div>
          <div className={`${isMobile ? "order-2" : ""} border rounded-lg p-4 shadow-sm bg-card`}>
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-cricket-secondary" />
              <h3 className="text-lg font-semibold">Top Bowlers</h3>
            </div>
            <StatisticsTable 
              title="" 
              players={topBowlers} 
              type="bowling"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerStatsSection;
