
import { Loader2 } from 'lucide-react';

const LiveMatchLoading = () => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <span className="h-3 w-3 rounded-full bg-red-500 mr-2 animate-pulse"></span>
        Live Match
      </h2>
      <div className="flex justify-center items-center h-48 bg-gray-50 rounded-lg shadow-sm">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 text-cricket-primary animate-spin" />
          <p className="text-cricket-primary font-medium">Loading match data...</p>
        </div>
      </div>
    </div>
  );
};

export default LiveMatchLoading;
