
import { useNavigate } from 'react-router-dom';
import { BarChart4, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatisticsTable from '@/components/StatisticsTable';
import { Player } from '@/types/cricket';

interface PlayerStatsSectionProps {
  topBatsmen: Player[];
  topBowlers: Player[];
}

const PlayerStatsSection = ({ topBatsmen, topBowlers }: PlayerStatsSectionProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <BarChart4 className="mr-2 h-5 w-5 text-cricket-secondary" />
          Player Statistics
        </h2>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center"
          onClick={() => navigate('/statistics')}
        >
          View all stats <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatisticsTable 
          title="Top Batsmen" 
          players={topBatsmen} 
          type="batting"
        />
        <StatisticsTable 
          title="Top Bowlers" 
          players={topBowlers} 
          type="bowling"
        />
      </div>
    </div>
  );
};

export default PlayerStatsSection;
