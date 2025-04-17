
import { Button } from '@/components/ui/button';
import { PlayCircle, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NoLiveMatchSectionProps {
  upcomingMatchCount?: number;
}

const NoLiveMatchSection = ({ upcomingMatchCount = 0 }: NoLiveMatchSectionProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="mb-8 p-6 bg-gray-50 rounded-lg">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-600">No Live Matches</h2>
        <p className="text-gray-500 mt-2 mb-4">Check back later for live cricket action!</p>
        
        <div className="flex justify-center gap-3 mt-4">
          {upcomingMatchCount > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/matches')}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              View {upcomingMatchCount} upcoming {upcomingMatchCount === 1 ? 'match' : 'matches'}
            </Button>
          )}
          
          <Button 
            variant="default" 
            size="sm"
            onClick={() => navigate('/matches')}
            className="flex items-center gap-2"
          >
            <PlayCircle className="h-4 w-4" />
            Browse All Matches
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NoLiveMatchSection;
