
import { Badge } from '@/components/ui/badge';

const LiveMatchHeader = () => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl md:text-2xl font-bold flex items-center">
        <span className="h-3 w-3 rounded-full bg-red-500 mr-2 animate-pulse"></span>
        Live Match
      </h2>
      <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 py-1 px-3">
        LIVE
      </Badge>
    </div>
  );
};

export default LiveMatchHeader;
