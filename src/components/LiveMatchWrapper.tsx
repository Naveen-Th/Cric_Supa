import { useCricket } from '@/context/CricketContext';
import { Match, Team } from '@/types/cricket';
import LiveMatch from './LiveMatch';
import LiveMatchControl from './admin/LiveMatchControl';
import { useEffect, useState } from 'react';

interface LiveMatchWrapperProps {
  match: Match;
  teams: Team[];
  isAdmin?: boolean;
}

const LiveMatchWrapper = ({ match, teams, isAdmin = false }: LiveMatchWrapperProps) => {
  const [striker, setStriker] = useState<string | null>(null);
  const [nonStriker, setNonStriker] = useState<string | null>(null);

  useEffect(() => {
    // Update striker/non-striker whenever localStorage changes
    const updatePlayers = () => {
      const state = localStorage.getItem(`cricket_match_state_${match.id}`);
      if (state) {
        const { striker: newStriker, nonStriker: newNonStriker } = JSON.parse(state);
        setStriker(newStriker);
        setNonStriker(newNonStriker);
      }
    };

    // Initial load
    updatePlayers();

    // Listen for storage changes
    window.addEventListener('storage', updatePlayers);
    
    return () => {
      window.removeEventListener('storage', updatePlayers);
    };
  }, [match.id]);

  return (
    <div className="space-y-6">
      <LiveMatch 
        match={match} 
        teams={teams} 
        isAdmin={isAdmin}
        striker={striker}
        nonStriker={nonStriker}
      />
      {isAdmin && (
        <LiveMatchControl match={match} teams={teams} />
      )}
    </div>
  );
};

export default LiveMatchWrapper;
