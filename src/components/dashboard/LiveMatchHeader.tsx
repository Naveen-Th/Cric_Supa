
import { Badge } from '@/components/ui/badge';
import { CircleDot, Radio } from 'lucide-react';

const LiveMatchHeader = () => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl md:text-2xl font-bold flex items-center">
        <CircleDot className="h-5 w-5 text-red-500 mr-2 animate-pulse" />
        Live Match
      </h2>
      <Badge variant="outline" className="bg-gradient-to-r from-red-500 to-red-600 text-white border-none py-1 px-3 flex items-center gap-1">
        <Radio className="h-3 w-3 text-white animate-pulse" />
        LIVE
      </Badge>
    </div>
  );
};

export default LiveMatchHeader;
