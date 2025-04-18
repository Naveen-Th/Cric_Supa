
import { Card, CardContent } from '@/components/ui/card';

const LiveMatchError = () => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <span className="h-3 w-3 rounded-full bg-red-500 mr-2 animate-pulse"></span>
        Live Match
      </h2>
      <Card className="shadow-md">
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Match data is incomplete. Unable to display match details.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveMatchError;
