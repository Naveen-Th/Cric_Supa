
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';

interface PlayerSearchProps {
  onSearch: (term: string) => void;
  initialSearchTerm?: string;
}

const PlayerSearch = ({ onSearch, initialSearchTerm = '' }: PlayerSearchProps) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch(value);
  };
  
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Search players by name or team..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerSearch;
